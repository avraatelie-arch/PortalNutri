import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { PrismaClient } from '@prisma/client';
import { requireDatabaseUrl } from '../../../../config/test-env.js';
import { RegisterCredentialCommand } from '../../application/register-credential/register-credential.command.js';
import { RegisterCredentialHandler } from '../../application/register-credential/register-credential.handler.js';
import { CreatePersonCommand } from '../../application/create-person/create-person.command.js';
import { CreatePersonHandler } from '../../application/create-person/create-person.handler.js';
import { DocumentType } from '../../domain/value-objects/document.js';
import { CredentialStatus } from '../../domain/value-objects/credential-status.js';
import { PersonId } from '../../domain/value-objects/person-id.js';
import { Argon2PasswordHasher } from '../cryptography/argon2-password-hasher.js';
import { PrismaCredentialRepository } from './prisma-credential.repository.js';
import { PrismaPersonRepository } from './prisma-person.repository.js';

requireDatabaseUrl();

const prisma = new PrismaClient();
const personRepository = new PrismaPersonRepository(prisma);
const credentialRepository = new PrismaCredentialRepository(prisma);
const passwordHasher = new Argon2PasswordHasher({
  timeCost: 2,
  memoryCost: 65536,
  parallelism: 1,
});

async function resetAuthData() {
  await prisma.credential.deleteMany();
  await prisma.person.deleteMany();
}

describe('PrismaCredentialRepository (integration)', () => {
  before(async () => {
    await resetAuthData();
  });

  after(async () => {
    await resetAuthData();
    await prisma.$disconnect();
  });

  it('persists and finds a credential by person id', async () => {
    const createHandler = new CreatePersonHandler(personRepository);
    const registerHandler = new RegisterCredentialHandler(
      personRepository,
      credentialRepository,
      passwordHasher,
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

    const registered = await registerHandler.execute(
      new RegisterCredentialCommand({
        personId: created.id,
        password: 'SecureP@ssw0rd',
      }),
    );

    const found = await credentialRepository.findByPersonId(
      PersonId.create(created.id),
    );

    assert.ok(found);
    assert.equal(found.getId().toString(), registered.id);
    assert.equal(found.getPersonId().toString(), created.id);
    assert.equal(found.getStatus(), CredentialStatus.Active);
    assert.match(found.getPasswordHash().toString(), /^\$argon2id\$/);
  });
});
