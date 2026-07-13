import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { DocumentType } from '../../domain/value-objects/document.js';
import { PersonStatus } from '../../domain/value-objects/person-status.js';
import { PersonDocumentAlreadyExistsError } from '../errors/person-document-already-exists.error.js';
import { PersonEmailAlreadyExistsError } from '../errors/person-email-already-exists.error.js';
import { PersonValidationError } from '../errors/person-validation.error.js';
import { CreatePersonCommand } from './create-person.command.js';
import { CreatePersonHandler } from './create-person.handler.js';
import { PersonId } from '../../domain/value-objects/person-id.js';
import type { PersonRepository } from '../../domain/repositories/person-repository.js';
import { InMemoryPersonRepository } from '../../infrastructure/repositories/in-memory-person.repository.js';
import { CapturingEventDispatcher } from '../../../../test-support/capturing-event-dispatcher.js';
import { noopEventDispatcher } from '../../../../test-support/noop-event-dispatcher.js';

function createHandler() {
  return new CreatePersonHandler(new InMemoryPersonRepository(), noopEventDispatcher);
}

function createValidCommand(
  overrides: Partial<CreatePersonCommand['request']> = {},
) {
  return new CreatePersonCommand({
    fullName: 'Maria Silva',
    email: 'maria.silva@example.com',
    documentType: DocumentType.PASSPORT,
    document: 'AB123456',
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
    assert.equal(response.document, 'AB123456');
    assert.equal(response.birthDate, '1990-06-15');
    assert.equal(response.phone, '+5511999999999');
    assert.equal(response.preferredName, null);
    assert.equal(response.status, PersonStatus.Active);
    assert.match(response.id, /^[0-9a-f-]{36}$/i);
  });

  it('creates a person with preferred name', async () => {
    const handler = createHandler();

    const response = await handler.execute(
      createValidCommand({ preferredName: '  Mari  ' }),
    );

    assert.equal(response.preferredName, 'Mari');
  });

  it('persists the created person in repository', async () => {
    const repository = new InMemoryPersonRepository();
    const handler = new CreatePersonHandler(repository, noopEventDispatcher);

    const response = await handler.execute(createValidCommand());
    const saved = await repository.findById(PersonId.create(response.id));

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
            document: 'CD987654',
          }),
        ),
      PersonEmailAlreadyExistsError,
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
            document: 'AB123456',
          }),
        ),
      PersonDocumentAlreadyExistsError,
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
      PersonValidationError,
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
      PersonValidationError,
    );
  });

  it('dispatches domain events only after successful persistence', async () => {
    const eventDispatcher = new CapturingEventDispatcher();
    const handler = new CreatePersonHandler(
      new InMemoryPersonRepository(),
      eventDispatcher,
    );

    const response = await handler.execute(createValidCommand());

    assert.equal(eventDispatcher.dispatched.length, 1);
    const dispatchedEvents = eventDispatcher.dispatched[0] ?? [];
    assert.equal(dispatchedEvents.length, 1);
    assert.equal(
      (dispatchedEvents[0] as { eventName: string }).eventName,
      'PersonCreated',
    );
    assert.equal(response.id.length > 0, true);
    assert.equal('eventName' in response, false);
  });

  it('does not dispatch events when persistence fails', async () => {
    const eventDispatcher = new CapturingEventDispatcher();
    const failingRepository: PersonRepository = {
      async save() {
        throw new Error('persistence failed');
      },
      async findById() {
        return null;
      },
      async findByEmail() {
        return null;
      },
      async findByDocument() {
        return null;
      },
      async existsByEmail() {
        return false;
      },
      async existsByDocument() {
        return false;
      },
    };
    const handler = new CreatePersonHandler(
      failingRepository,
      eventDispatcher,
    );

    await assert.rejects(
      () => handler.execute(createValidCommand()),
      /persistence failed/,
    );
    assert.equal(eventDispatcher.dispatched.length, 0);
  });
});
