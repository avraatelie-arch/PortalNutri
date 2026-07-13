import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { PrismaClient } from '@prisma/client';
import { requireDatabaseUrl } from '../../../../config/test-env.js';
import { RegisterCredentialCommand } from '../../application/register-credential/register-credential.command.js';
import { RegisterCredentialHandler } from '../../application/register-credential/register-credential.handler.js';
import { AuthenticatePersonCommand } from '../../application/authenticate-person/authenticate-person.command.js';
import { AuthenticatePersonHandler } from '../../application/authenticate-person/authenticate-person.handler.js';
import { CreatePersonCommand } from '../../application/create-person/create-person.command.js';
import { CreatePersonHandler } from '../../application/create-person/create-person.handler.js';
import { DocumentType } from '../../domain/value-objects/document.js';
import { SessionId } from '../../domain/value-objects/session-id.js';
import { Argon2PasswordHasher } from '../cryptography/argon2-password-hasher.js';
import { JoseTokenService } from '../tokens/jose-token.service.js';
import { PrismaCredentialRepository } from './prisma-credential.repository.js';
import { PrismaPersonRepository } from './prisma-person.repository.js';
import { PrismaSessionRepository } from './prisma-session.repository.js';
import { createTestJwtConfig } from '../../../../test-support/jwt-test.config.js';
import { noopEventDispatcher } from '../../../../test-support/noop-event-dispatcher.js';

requireDatabaseUrl();

const prisma = new PrismaClient();
const personRepository = new PrismaPersonRepository(prisma);
const credentialRepository = new PrismaCredentialRepository(prisma);
const sessionRepository = new PrismaSessionRepository(prisma);
const passwordHasher = new Argon2PasswordHasher({
  timeCost: 2,
  memoryCost: 65536,
  parallelism: 1,
});
const tokenService = new JoseTokenService(createTestJwtConfig());

async function resetAuthData() {
  await prisma.session.deleteMany();
  await prisma.credential.deleteMany();
  await prisma.person.deleteMany();
}

describe('PrismaSessionRepository (integration)', () => {
  before(async () => {
    await resetAuthData();
  });

  after(async () => {
    await resetAuthData();
    await prisma.$disconnect();
  });

  it('persists and finds a session by id', async () => {
    const createHandler = new CreatePersonHandler(personRepository, noopEventDispatcher);
    const registerHandler = new RegisterCredentialHandler(
      personRepository,
      credentialRepository,
      passwordHasher,
    );
    const authenticateHandler = new AuthenticatePersonHandler(
      personRepository,
      credentialRepository,
      sessionRepository,
      passwordHasher,
      tokenService,
      noopEventDispatcher,
    );

    const created = await createHandler.execute(
      new CreatePersonCommand({
        fullName: 'Maria Silva',
        email: 'maria.silva@example.com',
        documentType: DocumentType.PASSPORT,
        document: 'AB123456',
        birthDate: '1990-06-15',
      }),
    );

    await registerHandler.execute(
      new RegisterCredentialCommand({
        personId: created.id,
        password: 'SecureP@ssw0rd',
      }),
    );

    const authenticated = await authenticateHandler.execute(
      new AuthenticatePersonCommand({
        email: 'maria.silva@example.com',
        password: 'SecureP@ssw0rd',
      }),
    );

    const [sessionId] = authenticated.refreshToken.split('.');
    const found = await sessionRepository.findById(SessionId.create(sessionId!));

    assert.ok(found);
    assert.equal(found.getPersonId().toString(), created.id);
    assert.equal(found.getTenantId(), null);
    assert.equal(found.isActive(), true);
  });
});
