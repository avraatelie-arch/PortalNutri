import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { DocumentType } from '../../domain/value-objects/document.js';
import { Credential } from '../../domain/aggregates/credential.aggregate.js';
import { CredentialId } from '../../domain/value-objects/credential-id.js';
import { CredentialStatus } from '../../domain/value-objects/credential-status.js';
import { PasswordHash } from '../../domain/value-objects/password-hash.js';
import { PersonId } from '../../domain/value-objects/person-id.js';
import { SessionId } from '../../domain/value-objects/session-id.js';
import type { PasswordHasher } from '../../domain/services/password-hasher.port.js';
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
  const createHandler = new CreatePersonHandler(personRepository);
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
) {
  const tokenService = new JoseTokenService(createTestJwtConfig());

  return new AuthenticatePersonHandler(
    personRepository,
    credentialRepository,
    sessionRepository,
    new FakePasswordHasher(),
    tokenService,
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
    const [sessionId] = response.refreshToken.split('.');
    const session = await sessionRepository.findById(
      SessionId.create(sessionId!),
    );

    assert.ok(session);
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
    const deactivateHandler = new DeactivatePersonHandler(personRepository);
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

    const [sessionId] = response.refreshToken.split('.');
    const session = await sessionRepository.findById(
      SessionId.create(sessionId!),
    );

    assert.ok(session);
  });
});
