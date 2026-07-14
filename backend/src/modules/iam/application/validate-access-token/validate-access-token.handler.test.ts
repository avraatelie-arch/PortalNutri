import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { SignJWT } from 'jose';
import { DocumentType } from '../../domain/value-objects/document.js';
import { Session } from '../../domain/aggregates/session.aggregate.js';
import { PersonId } from '../../domain/value-objects/person-id.js';
import { RefreshTokenFamilyId } from '../../domain/value-objects/refresh-token-family-id.js';
import { RefreshTokenHash } from '../../domain/value-objects/refresh-token-hash.js';
import { SessionId } from '../../domain/value-objects/session-id.js';
import { SessionStatus } from '../../domain/value-objects/session-status.js';
import type { PasswordHasher } from '../ports/password-hasher.port.js';
import { CreatePersonCommand } from '../create-person/create-person.command.js';
import { CreatePersonHandler } from '../create-person/create-person.handler.js';
import { RegisterCredentialCommand } from '../register-credential/register-credential.command.js';
import { RegisterCredentialHandler } from '../register-credential/register-credential.handler.js';
import { AuthenticatePersonCommand } from '../authenticate-person/authenticate-person.command.js';
import { AuthenticatePersonHandler } from '../authenticate-person/authenticate-person.handler.js';
import { InvalidAccessTokenError } from '../errors/invalid-access-token.error.js';
import { SessionExpiredError } from '../errors/session-expired.error.js';
import { SessionNotFoundError } from '../errors/session-not-found.error.js';
import { SessionRevokedError } from '../errors/session-revoked.error.js';
import { InMemoryCredentialRepository } from '../../infrastructure/repositories/in-memory-credential.repository.js';
import { InMemoryPersonRepository } from '../../infrastructure/repositories/in-memory-person.repository.js';
import { InMemorySessionRepository } from '../../infrastructure/repositories/in-memory-session.repository.js';
import { JoseTokenService } from '../../infrastructure/tokens/jose-token.service.js';
import {
  createTestJwtConfig,
  TEST_JWT_SECRET,
} from '../../../../test-support/jwt-test.config.js';
import { noopEventDispatcher } from '../../../../test-support/noop-event-dispatcher.js';
import { ValidateAccessTokenQuery } from './validate-access-token.query.js';
import { ValidateAccessTokenHandler } from './validate-access-token.handler.js';

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

  const validateHandler = new ValidateAccessTokenHandler(
    sessionRepository,
    tokenService,
  );

  return {
    created,
    sessionRepository,
    validateHandler,
    authenticated,
  };
}

describe('ValidateAccessTokenHandler', () => {
  it('validates a valid access token', async () => {
    const { created, validateHandler, authenticated } = await login();
    const [sessionId] = authenticated.refreshToken.split('.');

    const result = await validateHandler.execute(
      new ValidateAccessTokenQuery({
        accessToken: authenticated.accessToken,
      }),
    );

    assert.equal(result.securityContext.personId, created.id);
    assert.equal(result.securityContext.sessionId, sessionId);
    assert.equal(result.securityContext.tenantId, null);
  });

  it('rejects an invalid signature', async () => {
    const { validateHandler, authenticated } = await login();
    const tampered = `${authenticated.accessToken}x`;

    await assert.rejects(
      validateHandler.execute(
        new ValidateAccessTokenQuery({ accessToken: tampered }),
      ),
      InvalidAccessTokenError,
    );
  });

  it('rejects an expired JWT', async () => {
    const tokenService = new JoseTokenService(createTestJwtConfig());
    const validateHandler = new ValidateAccessTokenHandler(
      new InMemorySessionRepository(),
      tokenService,
    );
    const secretKey = new TextEncoder().encode(TEST_JWT_SECRET);
    const expiredToken = await new SignJWT({
      sid: '660e8400-e29b-41d4-a716-446655440001',
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject('550e8400-e29b-41d4-a716-446655440000')
      .setIssuer('portalnutri')
      .setJti(crypto.randomUUID())
      .setIssuedAt(new Date('2020-01-01T00:00:00.000Z'))
      .setExpirationTime(new Date('2020-01-01T00:00:01.000Z'))
      .sign(secretKey);

    await assert.rejects(
      validateHandler.execute(
        new ValidateAccessTokenQuery({ accessToken: expiredToken }),
      ),
      InvalidAccessTokenError,
    );
  });

  it('rejects a missing session', async () => {
    const tokenService = new JoseTokenService(createTestJwtConfig());
    const validateHandler = new ValidateAccessTokenHandler(
      new InMemorySessionRepository(),
      tokenService,
    );
    const issued = await tokenService.issueAccessToken({
      personId: '550e8400-e29b-41d4-a716-446655440000',
      sessionId: '660e8400-e29b-41d4-a716-446655440099',
      tenantId: null,
    });

    await assert.rejects(
      validateHandler.execute(
        new ValidateAccessTokenQuery({ accessToken: issued.accessToken }),
      ),
      SessionNotFoundError,
    );
  });

  it('rejects a revoked session', async () => {
    const sessionRepository = new InMemorySessionRepository();
    const tokenService = new JoseTokenService(createTestJwtConfig());
    const sessionId = SessionId.create('660e8400-e29b-41d4-a716-446655440001');
    const personId = PersonId.create('550e8400-e29b-41d4-a716-446655440000');
    const revokedSession = Session.reconstitute({
      id: sessionId,
      personId,
      tenantId: null,
      status: SessionStatus.Revoked,
      refreshTokenHash: RefreshTokenHash.fromHash('hash'),
      refreshTokenFamilyId: RefreshTokenFamilyId.generate(),
      refreshTokenExpiresAt: new Date('2030-01-01T00:00:00.000Z'),
      expiresAt: new Date('2030-01-01T00:00:00.000Z'),
      lastAccessAt: new Date(),
      createdAt: new Date(),
      revokedAt: new Date(),
    });

    await sessionRepository.save(revokedSession);

    const validateHandler = new ValidateAccessTokenHandler(
      sessionRepository,
      tokenService,
    );
    const issued = await tokenService.issueAccessToken({
      personId: personId.toString(),
      sessionId: sessionId.toString(),
      tenantId: null,
    });

    await assert.rejects(
      validateHandler.execute(
        new ValidateAccessTokenQuery({ accessToken: issued.accessToken }),
      ),
      SessionRevokedError,
    );
  });

  it('rejects an expired session', async () => {
    const sessionRepository = new InMemorySessionRepository();
    const tokenService = new JoseTokenService(createTestJwtConfig());
    const sessionId = SessionId.create('660e8400-e29b-41d4-a716-446655440001');
    const personId = PersonId.create('550e8400-e29b-41d4-a716-446655440000');
    const expiredSession = Session.reconstitute({
      id: sessionId,
      personId,
      tenantId: null,
      status: SessionStatus.Active,
      refreshTokenHash: RefreshTokenHash.fromHash('hash'),
      refreshTokenFamilyId: RefreshTokenFamilyId.generate(),
      refreshTokenExpiresAt: new Date('2030-01-01T00:00:00.000Z'),
      expiresAt: new Date('2020-01-01T00:00:00.000Z'),
      lastAccessAt: new Date('2020-01-01T00:00:00.000Z'),
      createdAt: new Date('2020-01-01T00:00:00.000Z'),
      revokedAt: null,
    });

    await sessionRepository.save(expiredSession);

    const validateHandler = new ValidateAccessTokenHandler(
      sessionRepository,
      tokenService,
    );
    const issued = await tokenService.issueAccessToken({
      personId: personId.toString(),
      sessionId: sessionId.toString(),
      tenantId: null,
    });

    await assert.rejects(
      validateHandler.execute(
        new ValidateAccessTokenQuery({ accessToken: issued.accessToken }),
      ),
      SessionExpiredError,
    );
  });
});
