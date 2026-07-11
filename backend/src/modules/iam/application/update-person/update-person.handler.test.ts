import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { DomainError } from '../../domain/errors/domain-error.js';
import { DocumentType } from '../../domain/value-objects/document.js';
import { PersonStatus } from '../../domain/value-objects/person-status.js';
import { CreatePersonCommand } from '../create-person/create-person.command.js';
import { CreatePersonHandler } from '../create-person/create-person.handler.js';
import { PersonEmailAlreadyExistsError } from '../errors/person-email-already-exists.error.js';
import { PersonNotFoundError } from '../errors/person-not-found.error.js';
import { PersonId } from '../../domain/value-objects/person-id.js';
import { InMemoryPersonRepository } from '../../infrastructure/repositories/in-memory-person.repository.js';
import { UpdatePersonCommand } from './update-person.command.js';
import { UpdatePersonHandler } from './update-person.handler.js';

const UNKNOWN_PERSON_ID = '550e8400-e29b-41d4-a716-446655440099';

async function seedPerson(
  overrides: Partial<CreatePersonCommand['request']> = {},
  repository = new InMemoryPersonRepository(),
) {
  const createHandler = new CreatePersonHandler(repository);

  const created = await createHandler.execute(
    new CreatePersonCommand({
      fullName: 'Maria Silva',
      email: 'maria.silva@example.com',
      documentType: DocumentType.PASSPORT,
      documentValue: 'AB123456',
      birthDate: '1990-06-15',
      phone: '+5511999999999',
      ...overrides,
    }),
  );

  return { repository, created };
}

describe('UpdatePersonHandler', () => {
  it('updates full name', async () => {
    const { repository, created } = await seedPerson();
    const handler = new UpdatePersonHandler(repository);

    const result = await handler.execute(
      new UpdatePersonCommand({
        personId: created.personId,
        fullName: 'Maria Oliveira',
      }),
    );

    assert.equal(result.fullName, 'Maria Oliveira');
    assert.equal(result.id, created.personId);
  });

  it('updates preferred name', async () => {
    const { repository, created } = await seedPerson();
    const handler = new UpdatePersonHandler(repository);

    const result = await handler.execute(
      new UpdatePersonCommand({
        personId: created.personId,
        preferredName: '  Mari  ',
      }),
    );

    assert.equal(result.preferredName, 'Mari');
  });

  it('clears preferred name', async () => {
    const { repository, created } = await seedPerson({
      preferredName: 'Mari',
    });
    const handler = new UpdatePersonHandler(repository);

    const result = await handler.execute(
      new UpdatePersonCommand({
        personId: created.personId,
        preferredName: null,
      }),
    );

    assert.equal(result.preferredName, null);
  });

  it('updates email', async () => {
    const { repository, created } = await seedPerson();
    const handler = new UpdatePersonHandler(repository);

    const result = await handler.execute(
      new UpdatePersonCommand({
        personId: created.personId,
        email: 'maria.oliveira@example.com',
      }),
    );

    assert.equal(result.email, 'maria.oliveira@example.com');
  });

  it('updates phone', async () => {
    const { repository, created } = await seedPerson();
    const handler = new UpdatePersonHandler(repository);

    const result = await handler.execute(
      new UpdatePersonCommand({
        personId: created.personId,
        phone: '+5511888888888',
      }),
    );

    assert.equal(result.phone, '+5511888888888');
  });

  it('publishes PersonUpdated event in result', async () => {
    const { repository, created } = await seedPerson();
    const handler = new UpdatePersonHandler(repository);

    const result = await handler.execute(
      new UpdatePersonCommand({
        personId: created.personId,
        fullName: 'Maria Oliveira',
      }),
    );

    assert.equal(result.events.length, 1);
    assert.equal(result.events[0]?.eventName, 'PersonUpdated');
    assert.equal(result.events[0]?.aggregateId, created.personId);
  });

  it('persists updated person in repository', async () => {
    const { repository, created } = await seedPerson();
    const handler = new UpdatePersonHandler(repository);

    await handler.execute(
      new UpdatePersonCommand({
        personId: created.personId,
        fullName: 'Maria Oliveira',
      }),
    );

    const saved = await repository.findById(PersonId.create(created.personId));

    assert.ok(saved);
    assert.equal(saved.getFullName().toString(), 'Maria Oliveira');
  });

  it('does not change document or birth date', async () => {
    const { repository, created } = await seedPerson();
    const handler = new UpdatePersonHandler(repository);

    const result = await handler.execute(
      new UpdatePersonCommand({
        personId: created.personId,
        fullName: 'Maria Oliveira',
        email: 'maria.oliveira@example.com',
      }),
    );

    assert.equal(result.document, 'AB123456');
    assert.equal(result.documentType, DocumentType.PASSPORT);
    assert.equal(result.birthDate, '1990-06-15');
  });

  it('rejects duplicate email from another person', async () => {
    const repository = new InMemoryPersonRepository();
    const createHandler = new CreatePersonHandler(repository);
    const updateHandler = new UpdatePersonHandler(repository);

    const first = await createHandler.execute(
      new CreatePersonCommand({
        fullName: 'Maria Silva',
        email: 'maria.silva@example.com',
        documentType: DocumentType.PASSPORT,
        documentValue: 'AB123456',
        birthDate: '1990-06-15',
      }),
    );

    const second = await createHandler.execute(
      new CreatePersonCommand({
        fullName: 'João Santos',
        email: 'joao.santos@example.com',
        documentType: DocumentType.PASSPORT,
        documentValue: 'CD987654',
        birthDate: '1985-03-20',
      }),
    );

    await assert.rejects(
      () =>
        updateHandler.execute(
          new UpdatePersonCommand({
            personId: second.personId,
            email: 'maria.silva@example.com',
          }),
        ),
      PersonEmailAlreadyExistsError,
    );

    const unchanged = await repository.findById(PersonId.create(first.personId));
    assert.ok(unchanged);
    assert.equal(unchanged.getEmail().toString(), 'maria.silva@example.com');
  });

  it('allows updating with the same email', async () => {
    const { repository, created } = await seedPerson();
    const handler = new UpdatePersonHandler(repository);

    const result = await handler.execute(
      new UpdatePersonCommand({
        personId: created.personId,
        email: 'maria.silva@example.com',
        fullName: 'Maria Oliveira',
      }),
    );

    assert.equal(result.email, 'maria.silva@example.com');
    assert.equal(result.fullName, 'Maria Oliveira');
    assert.equal(result.events.length, 1);
    assert.equal(result.events[0]?.eventName, 'PersonUpdated');
  });

  it('throws PersonNotFoundError when person does not exist', async () => {
    const handler = new UpdatePersonHandler(new InMemoryPersonRepository());

    await assert.rejects(
      () =>
        handler.execute(
          new UpdatePersonCommand({
            personId: UNKNOWN_PERSON_ID,
            fullName: 'Maria Oliveira',
          }),
        ),
      (error: unknown) => {
        assert.ok(error instanceof PersonNotFoundError);
        assert.equal(error.code, 'PERSON_NOT_FOUND');
        assert.equal(error.personId, UNKNOWN_PERSON_ID);
        return true;
      },
    );
  });

  it('rejects updating an inactive person', async () => {
    const { repository, created } = await seedPerson();
    const person = await repository.findById(PersonId.create(created.personId));

    assert.ok(person);
    person.deactivate();
    await repository.save(person);
    person.pullDomainEvents();

    const handler = new UpdatePersonHandler(repository);

    await assert.rejects(
      () =>
        handler.execute(
          new UpdatePersonCommand({
            personId: created.personId,
            fullName: 'Maria Oliveira',
          }),
        ),
      DomainError,
    );
  });

  it('returns empty events when no fields change', async () => {
    const { repository, created } = await seedPerson({
      preferredName: 'Mari',
    });
    const handler = new UpdatePersonHandler(repository);

    const result = await handler.execute(
      new UpdatePersonCommand({
        personId: created.personId,
        fullName: 'Maria Silva',
        preferredName: 'Mari',
        email: 'maria.silva@example.com',
        phone: '+5511999999999',
      }),
    );

    assert.equal(result.events.length, 0);
  });
});
