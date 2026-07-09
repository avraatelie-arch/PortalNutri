import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { DomainError } from '../errors/domain-error.js';
import {
  PersonActivated,
  PersonCreated,
  PersonDeactivated,
  PersonUpdated,
} from '../events/person-events.js';
import { BirthDate } from '../value-objects/birth-date.js';
import { Document, DocumentType } from '../value-objects/document.js';
import { Email } from '../value-objects/email.js';
import { FullName } from '../value-objects/full-name.js';
import { PersonId } from '../value-objects/person-id.js';
import { PersonStatus } from '../value-objects/person-status.js';
import { Person } from './person.aggregate.js';

const PERSON_ID = PersonId.create('550e8400-e29b-41d4-a716-446655440000');

function createValidPersonProps() {
  return {
    id: PERSON_ID,
    fullName: FullName.create('Maria Silva'),
    email: Email.create('maria.silva@example.com'),
    document: Document.create(DocumentType.PASSPORT, 'AB123456'),
    birthDate: BirthDate.create(new Date(1990, 5, 15)),
  };
}

describe('Person aggregate', () => {
  it('creates a valid person', () => {
    const person = Person.create(createValidPersonProps());

    assert.equal(person.getId().toString(), PERSON_ID.toString());
    assert.equal(person.getFullName().toString(), 'Maria Silva');
    assert.equal(person.getEmail().toString(), 'maria.silva@example.com');
    assert.equal(person.getDocument().getValue(), 'AB123456');
    assert.equal(person.getBirthDate().toString(), '1990-06-15');
  });

  it('starts with Active status', () => {
    const person = Person.create(createValidPersonProps());

    assert.equal(person.getStatus(), PersonStatus.Active);
    assert.equal(person.isActive(), true);
  });

  it('publishes PersonCreated on creation', () => {
    const person = Person.create(createValidPersonProps());
    const events = person.domainEvents;

    assert.equal(events.length, 1);
    assert.ok(events[0] instanceof PersonCreated);
    assert.equal(events[0].eventName, 'PersonCreated');
    assert.equal(events[0].aggregateId, PERSON_ID.toString());
  });

  it('publishes PersonDeactivated on deactivate', () => {
    const person = Person.create(createValidPersonProps());
    person.clearDomainEvents();

    person.deactivate();

    assert.equal(person.getStatus(), PersonStatus.Inactive);
    assert.equal(person.domainEvents.length, 1);
    assert.ok(person.domainEvents[0] instanceof PersonDeactivated);
    assert.equal(person.domainEvents[0].eventName, 'PersonDeactivated');
  });

  it('publishes PersonActivated on activate', () => {
    const person = Person.create(createValidPersonProps());
    person.deactivate();
    person.clearDomainEvents();

    person.activate();

    assert.equal(person.getStatus(), PersonStatus.Active);
    assert.equal(person.domainEvents.length, 1);
    assert.ok(person.domainEvents[0] instanceof PersonActivated);
    assert.equal(person.domainEvents[0].eventName, 'PersonActivated');
  });

  it('publishes PersonUpdated on update', () => {
    const person = Person.create(createValidPersonProps());
    person.clearDomainEvents();

    person.update({
      fullName: FullName.create('Maria Oliveira'),
      email: Email.create('maria.oliveira@example.com'),
    });

    assert.equal(person.getFullName().toString(), 'Maria Oliveira');
    assert.equal(person.getEmail().toString(), 'maria.oliveira@example.com');
    assert.equal(person.domainEvents.length, 1);
    assert.ok(person.domainEvents[0] instanceof PersonUpdated);
    assert.deepEqual(
      (person.domainEvents[0] as PersonUpdated).changedFields,
      ['fullName', 'email'],
    );
  });

  it('does not allow updating an inactive person', () => {
    const person = Person.create(createValidPersonProps());
    person.deactivate();

    assert.throws(
      () =>
        person.update({
          fullName: FullName.create('Maria Oliveira'),
        }),
      DomainError,
    );
  });

  it('pullDomainEvents returns and clears pending events', () => {
    const person = Person.create(createValidPersonProps());

    const events = person.pullDomainEvents();

    assert.equal(events.length, 1);
    assert.ok(events[0] instanceof PersonCreated);
    assert.equal(person.domainEvents.length, 0);
  });
});
