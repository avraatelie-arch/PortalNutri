import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { DomainError } from '../../domain/errors/domain-error.js';
import { DocumentType } from '../../domain/value-objects/document.js';
import { PersonStatus } from '../../domain/value-objects/person-status.js';
import { ApplicationError } from '../errors/application-error.js';
import { CreatePersonCommand } from './create-person.command.js';
import { CreatePersonHandler } from './create-person.handler.js';
import { PersonId } from '../../domain/value-objects/person-id.js';
import { InMemoryPersonRepository } from '../../infrastructure/repositories/in-memory-person.repository.js';

function createHandler() {
  return new CreatePersonHandler(new InMemoryPersonRepository());
}

function createValidCommand(
  overrides: Partial<CreatePersonCommand['request']> = {},
) {
  return new CreatePersonCommand({
    fullName: 'Maria Silva',
    email: 'maria.silva@example.com',
    documentType: DocumentType.PASSPORT,
    documentValue: 'AB123456',
    birthDate: '1990-06-15',
    phone: '+5511999999999',
    ...overrides,
  });
}

describe('CreatePersonHandler', () => {
  it('creates a valid person', async () => {
    const handler = createHandler();

    const response = await handler.execute(createValidCommand());

    assert.equal(response.fullName, 'Maria Silva');
    assert.equal(response.email, 'maria.silva@example.com');
    assert.equal(response.documentType, DocumentType.PASSPORT);
    assert.equal(response.documentValue, 'AB123456');
    assert.equal(response.birthDate, '1990-06-15');
    assert.equal(response.phone, '+5511999999999');
    assert.equal(response.status, PersonStatus.Active);
    assert.match(response.personId, /^[0-9a-f-]{36}$/i);
  });

  it('publishes PersonCreated event in response', async () => {
    const handler = createHandler();

    const response = await handler.execute(createValidCommand());

    assert.equal(response.events.length, 1);
    assert.equal(response.events[0]?.eventName, 'PersonCreated');
    assert.equal(response.events[0]?.aggregateId, response.personId);
  });

  it('persists the created person in repository', async () => {
    const repository = new InMemoryPersonRepository();
    const handler = new CreatePersonHandler(repository);

    const response = await handler.execute(createValidCommand());
    const saved = await repository.findById(PersonId.create(response.personId));

    assert.ok(saved);
    assert.equal(saved.getEmail().toString(), 'maria.silva@example.com');
  });

  it('rejects duplicate email', async () => {
    const handler = createHandler();

    await handler.execute(createValidCommand());

    await assert.rejects(
      () =>
        handler.execute(
          createValidCommand({
            email: 'maria.silva@example.com',
            documentValue: 'CD987654',
          }),
        ),
      ApplicationError,
    );
  });

  it('rejects duplicate document', async () => {
    const handler = createHandler();

    await handler.execute(createValidCommand());

    await assert.rejects(
      () =>
        handler.execute(
          createValidCommand({
            email: 'outro.email@example.com',
            documentValue: 'AB123456',
          }),
        ),
      ApplicationError,
    );
  });

  it('rejects invalid email from domain validation', async () => {
    const handler = createHandler();

    await assert.rejects(
      () =>
        handler.execute(
          createValidCommand({
            email: 'invalid-email',
          }),
        ),
      DomainError,
    );
  });

  it('rejects invalid birth date format', async () => {
    const handler = createHandler();

    await assert.rejects(
      () =>
        handler.execute(
          createValidCommand({
            birthDate: '15-06-1990',
          }),
        ),
      ApplicationError,
    );
  });
});
