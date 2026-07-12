import type { FastifyInstance } from 'fastify';
import type { Env } from '../../config/env.js';
import { buildArgon2Config } from '../../config/argon2.js';
import { getPrismaClient } from '../../core/database/prisma-client.js';
import { CreatePersonHandler } from './application/create-person/create-person.handler.js';
import { DeactivatePersonHandler } from './application/deactivate-person/deactivate-person.handler.js';
import { FindPersonByIdHandler } from './application/find-person-by-id/find-person-by-id.handler.js';
import { RegisterCredentialHandler } from './application/register-credential/register-credential.handler.js';
import { UpdatePersonHandler } from './application/update-person/update-person.handler.js';
import { registerAuthRoutes } from './contracts/api/auth.routes.js';
import { registerPersonRoutes } from './contracts/api/person.routes.js';
import { Argon2PasswordHasher } from './infrastructure/cryptography/argon2-password-hasher.js';
import { PrismaCredentialRepository } from './infrastructure/repositories/prisma-credential.repository.js';
import { PrismaPersonRepository } from './infrastructure/repositories/prisma-person.repository.js';

function createIamDependencies(env: Env) {
  const prisma = getPrismaClient();
  const personRepository = new PrismaPersonRepository(prisma);
  const credentialRepository = new PrismaCredentialRepository(prisma);
  const passwordHasher = new Argon2PasswordHasher(buildArgon2Config(env));

  return {
    personHandlers: {
      createPersonHandler: new CreatePersonHandler(personRepository),
      findPersonByIdHandler: new FindPersonByIdHandler(personRepository),
      updatePersonHandler: new UpdatePersonHandler(personRepository),
      deactivatePersonHandler: new DeactivatePersonHandler(personRepository),
    },
    authHandlers: {
      registerCredentialHandler: new RegisterCredentialHandler(
        personRepository,
        credentialRepository,
        passwordHasher,
      ),
    },
  };
}

export async function registerIamModule(
  app: FastifyInstance,
  env: Env,
): Promise<void> {
  const { personHandlers } = createIamDependencies(env);

  await registerPersonRoutes(app, personHandlers);
}

export async function registerAuthModule(
  app: FastifyInstance,
  env: Env,
): Promise<void> {
  const { authHandlers } = createIamDependencies(env);

  await registerAuthRoutes(app, authHandlers);
}
