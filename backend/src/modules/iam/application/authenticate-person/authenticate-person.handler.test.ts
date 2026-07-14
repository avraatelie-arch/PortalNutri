import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { DocumentType } from '../../domain/value-objects/document.js';
import { Credential } from '../../domain/aggregates/credential.aggregate.js';
import { CredentialId } from '../../domain/value-objects/credential-id.js';
import { CredentialStatus } from '../../domain/value-objects/credential-status.js';
import { PasswordHash } from '../../domain/value-objects/password-hash.js';
import { PersonId } from '../../domain/value-objects/person-id.js';
import { SessionId } from '../../domain/value-objects/session-id.js';
import type { PasswordHasher } from '../ports/password-hasher.port.js';
import { CreatePersonCommand } from '../create-person/create-person.command.js';
import { CreatePersonHandler } from '../create-person/create-person.handler.js';
import { DeactivatePersonCommand } from '../deactivate-person/deactivate-person.command.js';
import { DeactivatePersonHandler } from '../deactivate-person/deactivate-person.handler.js';
import { RegisterCredentialCommand } from '../register-credential/register-credential.command.js';
import { RegisterCredentialHandler } from '../register-credential/register-credential.handler.js';
import { InvalidCredentialsError } from '../errors/invalid-credentials.error.js';
import { InMemoryCredentialRepository } from '../../infrastructure/repositories/in-memory-credential.repository.js';
import { InMemoryPersonRepository } from '../../infrastructure/repositories/in-memory-person.repository.js';
import { InMemorySessionRepository } from '../../infrastructure/repositories/in-memory-session.repository.js';
import { JoseTokenService } from '../../infrastructure/tokens/jose-token.service.js';
import { createTestJwtConfig } from '../../../../test-support/jwt-test.config.js';
import { AuthenticationSucceeded } from '../events/authentication-succeeded.event.js';
import { CapturingEventDispatcher } from '../../../../test-support/capturing-event-dispatcher.js';
import { noopEventDispatcher } from '../../../../test-support/noop-event-dispatcher.js';
import { AuthenticatePersonCommand } from './authenticate-person.command.js';
import { AuthenticatePersonHandler } from './authenticate-person.handler.js';

class FakePasswordHasher implements PasswordHasher {
  async hash(plainPassword: string): Promise<string> {
    return `$argon2id$fake$${plainPassword}`;
  }

  async verify(hash: string, plainPassword: string): Promise<boolean> {
    return hash === `$argon2id$fake$${plainPassword}`;
  }
}

async function seedPersonWithCredential(
  password = 'SecureP@ssw0rd',
  email = 'maria.silva@example.com',
) {
  const personRepository = new InMemoryPersonRepository();
  const credentialRepository = new InMemoryCredentialRepository();
  const createHandler = new CreatePersonHandler(personRepository, noopEventDispatcher);
  const created = await createHandler.execute(
    new CreatePersonCommand({
      fullName: 'Maria Silva',
      email,
      documentType: DocumentType.PASSPORT,
      document: 'AB123456',
      birthDate: '1990-06-15',
    }),
  );

  const registerHandler = new RegisterCredentialHandler(
    personRepository,
    credentialRepository,
    new FakePasswordHasher(),
  );

  await registerHandler.execute(
    new RegisterCredentialCommand({
      personId: created.id,
      password,
    }),
  );

  return {
    personRepository,
    credentialRepository,
    created,
    password,
  };
}

function createHandler(
  personRepository: InMemoryPersonRepository,
  credentialRepository: InMemoryCredentialRepository,
  sessionRepository = new InMemorySessionRepository(),
  eventDispatcher = noopEventDispatcher,
) {
  const tokenService = new JoseTokenService(createTestJwtConfig());

  return new AuthenticatePersonHandler(
    personRepository,
    credentialRepository,
    sessionRepository,
    new FakePasswordHasher(),
    tokenService,
    eventDispatcher,
  );
}

describe('AuthenticatePersonHandler', () => {
  it('authenticates with a valid login', async () => {
    const { personRepository, credentialRepository, created, password } =
      await seedPersonWithCredential();
    const sessionRepository = new InMemorySessionRepository();
    const handler = createHandler(
      personRepository,
      credentialRepository,
      sessionRepository,
    );

    const response = await handler.execute(
      new AuthenticatePersonCommand({
        email: 'maria.silva@example.com',
        password,
      }),
    );

    assert.match(response.accessToken, /^eyJ/);
    const session = await sessionRepository.findById(
      SessionId.create(response.sessionId),
    );

    assert.ok(session);
    assert.equal(response.sessionId, session.getId().toString());
    assert.equal(session.getPersonId().toString(), created.id);
  });

  it('rejects unknown email', async () => {
    const { personRepository, credentialRepository } =
      await seedPersonWithCredential();
    const handler = createHandler(personRepository, credentialRepository);

    await assert.rejects(
      handler.execute(
        new AuthenticatePersonCommand({
          email: 'unknown@example.com',
          password: 'SecureP@ssw0rd',
        }),
      ),
      InvalidCredentialsError,
    );
  });

  it('rejects wrong password', async () => {
    const { personRepository, credentialRepository } =
      await seedPersonWithCredential();
    const handler = createHandler(personRepository, credentialRepository);

    await assert.rejects(
      handler.execute(
        new AuthenticatePersonCommand({
          email: 'maria.silva@example.com',
          password: 'WrongP@ssw0rd',
        }),
      ),
      InvalidCredentialsError,
    );
  });

  it('rejects inactive person', async () => {
    const { personRepository, credentialRepository, created } =
      await seedPersonWithCredential();
    const deactivateHandler = new DeactivatePersonHandler(personRepository, noopEventDispatcher);
    await deactivateHandler.execute(new DeactivatePersonCommand(created.id));

    const handler = createHandler(personRepository, credentialRepository);

    await assert.rejects(
      handler.execute(
        new AuthenticatePersonCommand({
          email: 'maria.silva@example.com',
          password: 'SecureP@ssw0rd',
        }),
      ),
      InvalidCredentialsError,
    );
  });

  it('rejects inactive credential', async () => {
    const { personRepository, credentialRepository, created } =
      await seedPersonWithCredential();

    const locked = Credential.reconstitute({
      id: CredentialId.generate(),
      personId: PersonId.create(created.id),
      passwordHash: PasswordHash.fromHash('$argon2id$fake$SecureP@ssw0rd'),
      status: CredentialStatus.Locked,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await credentialRepository.save(locked);

    const handler = createHandler(personRepository, credentialRepository);

    await assert.rejects(
      handler.execute(
        new AuthenticatePersonCommand({
          email: 'maria.silva@example.com',
          password: 'SecureP@ssw0rd',
        }),
      ),
      InvalidCredentialsError,
    );
  });

  it('persists a session and returns a token pair', async () => {
    const { personRepository, credentialRepository, password } =
      await seedPersonWithCredential();
    const sessionRepository = new InMemorySessionRepository();
    const handler = createHandler(
      personRepository,
      credentialRepository,
      sessionRepository,
    );

    const response = await handler.execute(
      new AuthenticatePersonCommand({
        email: 'maria.silva@example.com',
        password,
      }),
    );

    assert.ok(response.accessToken);
    assert.ok(response.refreshToken);
    assert.ok(response.accessTokenExpiresAt instanceof Date);
    assert.match(response.sessionId, /^[0-9a-f-]{36}$/i);

    const session = await sessionRepository.findById(
      SessionId.create(response.sessionId),
    );

    assert.ok(session);
  });

  it('dispatches session domain events and AuthenticationSucceeded after save', async () => {
    const { personRepository, credentialRepository, created, password } =
      await seedPersonWithCredential();
    const eventDispatcher = new CapturingEventDispatcher();
    const handler = createHandler(
      personRepository,
      credentialRepository,
      new InMemorySessionRepository(),
      eventDispatcher,
    );

    await handler.execute(
      new AuthenticatePersonCommand({
        email: 'maria.silva@example.com',
        password,
      }),
    );

    assert.equal(eventDispatcher.dispatched.length, 1);
    const dispatchedEvents = eventDispatcher.dispatched[0] ?? [];
    assert.equal(dispatchedEvents.length, 2);
    assert.equal(
      (dispatchedEvents[0] as { eventName: string }).eventName,
      'SessionCreated',
    );
    assert.ok(dispatchedEvents[1] instanceof AuthenticationSucceeded);
    assert.equal(
      (dispatchedEvents[1] as AuthenticationSucceeded).personId,
      created.id,
    );
  });

  it('does not expose domain or application events in the response', async () => {
    const { personRepository, credentialRepository, password } =
      await seedPersonWithCredential();
    const eventDispatcher = new CapturingEventDispatcher();
    const handler = createHandler(
      personRepository,
      credentialRepository,
      new InMemorySessionRepository(),
      eventDispatcher,
    );

    const response = await handler.execute(
      new AuthenticatePersonCommand({
        email: 'maria.silva@example.com',
        password,
      }),
    );

    assert.deepEqual(Object.keys(response).sort(), [
      'accessToken',
      'accessTokenExpiresAt',
      'refreshToken',
      'sessionId',
    ]);
    assert.equal('eventName' in response, false);
    assert.equal('occurredAt' in response, false);
  });
});
