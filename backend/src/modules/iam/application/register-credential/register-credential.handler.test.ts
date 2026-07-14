import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { DocumentType } from '../../domain/value-objects/document.js';
import { PersonStatus } from '../../domain/value-objects/person-status.js';
import { CreatePersonCommand } from '../create-person/create-person.command.js';
import { CreatePersonHandler } from '../create-person/create-person.handler.js';
import { CredentialAlreadyExistsError } from '../errors/credential-already-exists.error.js';
import { PersonInactiveError } from '../errors/person-inactive.error.js';
import { PersonNotFoundError } from '../errors/person-not-found.error.js';
import { PersonId } from '../../domain/value-objects/person-id.js';
import type { PasswordHasher } from '../ports/password-hasher.port.js';
import { InMemoryCredentialRepository } from '../../infrastructure/repositories/in-memory-credential.repository.js';
import { InMemoryPersonRepository } from '../../infrastructure/repositories/in-memory-person.repository.js';
import { noopEventDispatcher } from '../../../../test-support/noop-event-dispatcher.js';
import { RegisterCredentialCommand } from './register-credential.command.js';
import { RegisterCredentialHandler } from './register-credential.handler.js';

const UNKNOWN_PERSON_ID = '550e8400-e29b-41d4-a716-446655440099';

class FakePasswordHasher implements PasswordHasher {
  async hash(plainPassword: string): Promise<string> {
    return `$argon2id$fake$${plainPassword}`;
  }

  async verify(hash: string, plainPassword: string): Promise<boolean> {
    return hash === `$argon2id$fake$${plainPassword}`;
  }
}

async function seedPerson(repository = new InMemoryPersonRepository()) {
  const createHandler = new CreatePersonHandler(repository, noopEventDispatcher);

  const created = await createHandler.execute(
    new CreatePersonCommand({
      fullName: 'Maria Silva',
      email: 'maria.silva@example.com',
      documentType: DocumentType.PASSPORT,
      document: 'AB123456',
      birthDate: '1990-06-15',
    }),
  );

  return { repository, created };
}

function createHandler(
  personRepository: InMemoryPersonRepository,
  credentialRepository = new InMemoryCredentialRepository(),
) {
  return new RegisterCredentialHandler(
    personRepository,
    credentialRepository,
    new FakePasswordHasher(),
  );
}

describe('RegisterCredentialHandler', () => {
  it('registers a credential for an active person', async () => {
    const { repository, created } = await seedPerson();
    const credentialRepository = new InMemoryCredentialRepository();
    const handler = createHandler(repository, credentialRepository);

    const response = await handler.execute(
      new RegisterCredentialCommand({
        personId: created.id,
        password: 'SecureP@ssw0rd',
      }),
    );

    assert.equal(response.personId, created.id);
    assert.equal(response.status, 'ACTIVE');
    assert.match(response.id, /^[0-9a-f-]{36}$/i);

    const saved = await credentialRepository.findByPersonId(
      PersonId.create(created.id),
    );

    assert.ok(saved);
    assert.match(saved.getPasswordHash().toString(), /^\$argon2id\$fake\$/);
  });

  it('rejects duplicate credential registration', async () => {
    const { repository, created } = await seedPerson();
    const handler = createHandler(repository);

    await handler.execute(
      new RegisterCredentialCommand({
        personId: created.id,
        password: 'SecureP@ssw0rd',
      }),
    );

    await assert.rejects(
      () =>
        handler.execute(
          new RegisterCredentialCommand({
            personId: created.id,
            password: 'AnotherP@ss1',
          }),
        ),
      CredentialAlreadyExistsError,
    );
  });

  it('rejects registration when person does not exist', async () => {
    const handler = createHandler(new InMemoryPersonRepository());

    await assert.rejects(
      () =>
        handler.execute(
          new RegisterCredentialCommand({
            personId: UNKNOWN_PERSON_ID,
            password: 'SecureP@ssw0rd',
          }),
        ),
      PersonNotFoundError,
    );
  });

  it('rejects registration when person is inactive', async () => {
    const { repository, created } = await seedPerson();
    const person = await repository.findById(PersonId.create(created.id));

    assert.ok(person);
    person.deactivate();
    await repository.save(person);
    person.pullDomainEvents();

    const handler = createHandler(repository);

    await assert.rejects(
      () =>
        handler.execute(
          new RegisterCredentialCommand({
            personId: created.id,
            password: 'SecureP@ssw0rd',
          }),
        ),
      PersonInactiveError,
    );
  });
});
