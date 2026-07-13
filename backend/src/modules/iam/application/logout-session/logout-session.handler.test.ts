import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { DocumentType } from '../../domain/value-objects/document.js';
import { SessionStatus } from '../../domain/value-objects/session-status.js';
import { SessionId } from '../../domain/value-objects/session-id.js';
import type { PasswordHasher } from '../../domain/services/password-hasher.port.js';
import { CreatePersonCommand } from '../create-person/create-person.command.js';
import { CreatePersonHandler } from '../create-person/create-person.handler.js';
import { RegisterCredentialCommand } from '../register-credential/register-credential.command.js';
import { RegisterCredentialHandler } from '../register-credential/register-credential.handler.js';
import { AuthenticatePersonCommand } from '../authenticate-person/authenticate-person.command.js';
import { AuthenticatePersonHandler } from '../authenticate-person/authenticate-person.handler.js';
import { SessionNotFoundError } from '../errors/session-not-found.error.js';
import { InMemoryCredentialRepository } from '../../infrastructure/repositories/in-memory-credential.repository.js';
import { InMemoryPersonRepository } from '../../infrastructure/repositories/in-memory-person.repository.js';
import { InMemorySessionRepository } from '../../infrastructure/repositories/in-memory-session.repository.js';
import { JoseTokenService } from '../../infrastructure/tokens/jose-token.service.js';
import { createTestJwtConfig } from '../../../../test-support/jwt-test.config.js';
import { noopEventDispatcher } from '../../../../test-support/noop-event-dispatcher.js';
import { LogoutSessionCommand } from './logout-session.command.js';
import { LogoutSessionHandler } from './logout-session.handler.js';

class FakePasswordHasher implements PasswordHasher {
  async hash(plainPassword: string): Promise<string> {
    return `$argon2id$fake$${plainPassword}`;
  }

  async verify(hash: string, plainPassword: string): Promise<boolean> {
    return hash === `$argon2id$fake$${plainPassword}`;
  }
}

async function login() {
  const personRepository = new InMemoryPersonRepository();
  const credentialRepository = new InMemoryCredentialRepository();
  const sessionRepository = new InMemorySessionRepository();
  const tokenService = new JoseTokenService(createTestJwtConfig());
  const password = 'SecureP@ssw0rd';

  const createHandler = new CreatePersonHandler(personRepository, noopEventDispatcher);
  const created = await createHandler.execute(
    new CreatePersonCommand({
      fullName: 'Maria Silva',
      email: 'maria.silva@example.com',
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

  const authenticateHandler = new AuthenticatePersonHandler(
    personRepository,
    credentialRepository,
    sessionRepository,
    new FakePasswordHasher(),
    tokenService,
    noopEventDispatcher,
  );

  const authenticated = await authenticateHandler.execute(
    new AuthenticatePersonCommand({
      email: 'maria.silva@example.com',
      password,
    }),
  );

  return {
    sessionRepository,
    sessionId: authenticated.sessionId,
    logoutHandler: new LogoutSessionHandler(sessionRepository, noopEventDispatcher),
  };
}

describe('LogoutSessionHandler', () => {
  it('revokes an active session', async () => {
    const { logoutHandler, sessionRepository, sessionId } = await login();

    const response = await logoutHandler.execute(
      new LogoutSessionCommand({ sessionId }),
    );

    assert.equal(response.sessionId, sessionId);

    const session = await sessionRepository.findById(
      SessionId.create(sessionId),
    );

    assert.equal(session?.getStatus(), SessionStatus.Revoked);
  });

  it('logs out idempotently', async () => {
    const { logoutHandler, sessionId } = await login();

    await logoutHandler.execute(new LogoutSessionCommand({ sessionId }));
    const response = await logoutHandler.execute(
      new LogoutSessionCommand({ sessionId }),
    );

    assert.equal(response.sessionId, sessionId);
  });

  it('throws when session does not exist', async () => {
    const handler = new LogoutSessionHandler(new InMemorySessionRepository(), noopEventDispatcher);

    await assert.rejects(
      handler.execute(
        new LogoutSessionCommand({
          sessionId: '550e8400-e29b-41d4-a716-446655440099',
        }),
      ),
      SessionNotFoundError,
    );
  });
});
