import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { DocumentType } from '../../domain/value-objects/document.js';
import { Session } from '../../domain/aggregates/session.aggregate.js';
import { PersonId } from '../../domain/value-objects/person-id.js';
import { RefreshTokenFamilyId } from '../../domain/value-objects/refresh-token-family-id.js';
import { RefreshTokenHash } from '../../domain/value-objects/refresh-token-hash.js';
import { SessionId } from '../../domain/value-objects/session-id.js';
import { SessionStatus } from '../../domain/value-objects/session-status.js';
import type { PasswordHasher } from '../../domain/services/password-hasher.port.js';
import { CreatePersonCommand } from '../create-person/create-person.command.js';
import { CreatePersonHandler } from '../create-person/create-person.handler.js';
import { RegisterCredentialCommand } from '../register-credential/register-credential.command.js';
import { RegisterCredentialHandler } from '../register-credential/register-credential.handler.js';
import { InvalidRefreshTokenError } from '../errors/invalid-refresh-token.error.js';
import { SessionExpiredError } from '../errors/session-expired.error.js';
import { SessionRevokedError } from '../errors/session-revoked.error.js';
import { AuthenticatePersonCommand } from '../authenticate-person/authenticate-person.command.js';
import { AuthenticatePersonHandler } from '../authenticate-person/authenticate-person.handler.js';
import { InMemoryCredentialRepository } from '../../infrastructure/repositories/in-memory-credential.repository.js';
import { InMemoryPersonRepository } from '../../infrastructure/repositories/in-memory-person.repository.js';
import { InMemorySessionRepository } from '../../infrastructure/repositories/in-memory-session.repository.js';
import { JoseTokenService } from '../../infrastructure/tokens/jose-token.service.js';
import { createTestJwtConfig } from '../../../../test-support/jwt-test.config.js';
import { RefreshSessionCommand } from './refresh-session.command.js';
import { RefreshSessionHandler } from './refresh-session.handler.js';

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

  const createHandler = new CreatePersonHandler(personRepository);
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
  );

  const authenticated = await authenticateHandler.execute(
    new AuthenticatePersonCommand({
      email: 'maria.silva@example.com',
      password,
    }),
  );

  const refreshHandler = new RefreshSessionHandler(
    sessionRepository,
    tokenService,
  );

  return {
    sessionRepository,
    refreshHandler,
    authenticated,
  };
}

describe('RefreshSessionHandler', () => {
  it('rotates a valid refresh token', async () => {
    const { refreshHandler, authenticated } = await login();

    const refreshed = await refreshHandler.execute(
      new RefreshSessionCommand({ refreshToken: authenticated.refreshToken }),
    );

    assert.ok(refreshed.accessToken);
    assert.notEqual(refreshed.refreshToken, authenticated.refreshToken);
  });

  it('rejects the old refresh token after rotation', async () => {
    const { refreshHandler, authenticated } = await login();

    await refreshHandler.execute(
      new RefreshSessionCommand({ refreshToken: authenticated.refreshToken }),
    );

    await assert.rejects(
      refreshHandler.execute(
        new RefreshSessionCommand({ refreshToken: authenticated.refreshToken }),
      ),
      InvalidRefreshTokenError,
    );
  });

  it('revokes the session when the refresh token mismatches', async () => {
    const { refreshHandler, authenticated, sessionRepository } = await login();
    const [sessionId] = authenticated.refreshToken.split('.');

    await assert.rejects(
      refreshHandler.execute(
        new RefreshSessionCommand({
          refreshToken: `${sessionId}.wrong-secret`,
        }),
      ),
      InvalidRefreshTokenError,
    );

    const session = await sessionRepository.findById(
      SessionId.create(sessionId!),
    );

    assert.equal(session?.getStatus(), SessionStatus.Revoked);
  });

  it('rejects an expired refresh token', async () => {
    const sessionRepository = new InMemorySessionRepository();
    const tokenService = new JoseTokenService(createTestJwtConfig());
    const sessionId = SessionId.generate();
    const secret = tokenService.generateRefreshTokenSecret();
    const expiredSession = Session.reconstitute({
      id: sessionId,
      personId: PersonId.create('550e8400-e29b-41d4-a716-446655440000'),
      tenantId: null,
      status: SessionStatus.Active,
      refreshTokenHash: RefreshTokenHash.fromHash(
        tokenService.hashRefreshToken(secret),
      ),
      refreshTokenFamilyId: RefreshTokenFamilyId.generate(),
      refreshTokenExpiresAt: new Date('2020-01-01T00:00:00.000Z'),
      expiresAt: new Date('2030-01-01T00:00:00.000Z'),
      lastAccessAt: new Date('2020-01-01T00:00:00.000Z'),
      createdAt: new Date('2020-01-01T00:00:00.000Z'),
      revokedAt: null,
    });

    await sessionRepository.save(expiredSession);

    const refreshHandler = new RefreshSessionHandler(
      sessionRepository,
      tokenService,
    );

    await assert.rejects(
      refreshHandler.execute(
        new RefreshSessionCommand({
          refreshToken: tokenService.formatRefreshToken(
            sessionId.toString(),
            secret,
          ),
        }),
      ),
      SessionExpiredError,
    );
  });

  it('rejects an expired absolute session', async () => {
    const sessionRepository = new InMemorySessionRepository();
    const tokenService = new JoseTokenService(createTestJwtConfig());
    const sessionId = SessionId.generate();
    const secret = tokenService.generateRefreshTokenSecret();
    const expiredSession = Session.reconstitute({
      id: sessionId,
      personId: PersonId.create('550e8400-e29b-41d4-a716-446655440000'),
      tenantId: null,
      status: SessionStatus.Active,
      refreshTokenHash: RefreshTokenHash.fromHash(
        tokenService.hashRefreshToken(secret),
      ),
      refreshTokenFamilyId: RefreshTokenFamilyId.generate(),
      refreshTokenExpiresAt: new Date('2030-01-01T00:00:00.000Z'),
      expiresAt: new Date('2020-01-01T00:00:00.000Z'),
      lastAccessAt: new Date('2020-01-01T00:00:00.000Z'),
      createdAt: new Date('2020-01-01T00:00:00.000Z'),
      revokedAt: null,
    });

    await sessionRepository.save(expiredSession);

    const refreshHandler = new RefreshSessionHandler(
      sessionRepository,
      tokenService,
    );

    await assert.rejects(
      refreshHandler.execute(
        new RefreshSessionCommand({
          refreshToken: tokenService.formatRefreshToken(
            sessionId.toString(),
            secret,
          ),
        }),
      ),
      SessionExpiredError,
    );
  });

  it('rejects a revoked session', async () => {
    const sessionRepository = new InMemorySessionRepository();
    const tokenService = new JoseTokenService(createTestJwtConfig());
    const sessionId = SessionId.generate();
    const secret = tokenService.generateRefreshTokenSecret();
    const revokedSession = Session.reconstitute({
      id: sessionId,
      personId: PersonId.create('550e8400-e29b-41d4-a716-446655440000'),
      tenantId: null,
      status: SessionStatus.Revoked,
      refreshTokenHash: RefreshTokenHash.fromHash(
        tokenService.hashRefreshToken(secret),
      ),
      refreshTokenFamilyId: RefreshTokenFamilyId.generate(),
      refreshTokenExpiresAt: new Date('2030-01-01T00:00:00.000Z'),
      expiresAt: new Date('2030-01-01T00:00:00.000Z'),
      lastAccessAt: new Date('2020-01-01T00:00:00.000Z'),
      createdAt: new Date('2020-01-01T00:00:00.000Z'),
      revokedAt: new Date('2020-01-02T00:00:00.000Z'),
    });

    await sessionRepository.save(revokedSession);

    const refreshHandler = new RefreshSessionHandler(
      sessionRepository,
      tokenService,
    );

    await assert.rejects(
      refreshHandler.execute(
        new RefreshSessionCommand({
          refreshToken: tokenService.formatRefreshToken(
            sessionId.toString(),
            secret,
          ),
        }),
      ),
      SessionRevokedError,
    );
  });
});
