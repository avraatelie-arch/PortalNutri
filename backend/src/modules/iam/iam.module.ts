import type { FastifyInstance } from 'fastify';
import type { Env } from '../../config/env.js';
import { buildArgon2Config } from '../../config/argon2.js';
import { buildJwtConfig } from '../../config/jwt.js';
import { getPrismaClient } from '../../core/database/prisma-client.js';
import { AuthenticatePersonHandler } from './application/authenticate-person/authenticate-person.handler.js';
import { CreatePersonHandler } from './application/create-person/create-person.handler.js';
import { DeactivatePersonHandler } from './application/deactivate-person/deactivate-person.handler.js';
import { FindPersonByIdHandler } from './application/find-person-by-id/find-person-by-id.handler.js';
import { LogoutSessionHandler } from './application/logout-session/logout-session.handler.js';
import { RefreshSessionHandler } from './application/refresh-session/refresh-session.handler.js';
import { RegisterCredentialHandler } from './application/register-credential/register-credential.handler.js';
import { UpdatePersonHandler } from './application/update-person/update-person.handler.js';
import { ValidateAccessTokenHandler } from './application/validate-access-token/validate-access-token.handler.js';
import type { ValidateAccessTokenHandler as ValidateAccessTokenHandlerType } from './application/validate-access-token/validate-access-token.handler.js';
import { registerAuthRoutes } from './contracts/api/auth.routes.js';
import type { AuthRouteHandlers } from './contracts/api/auth.routes.js';
import { registerPersonRoutes } from './contracts/api/person.routes.js';
import type { PersonRouteHandlers } from './contracts/api/person.routes.js';
import { Argon2PasswordHasher } from './infrastructure/cryptography/argon2-password-hasher.js';
import { PrismaCredentialRepository } from './infrastructure/repositories/prisma-credential.repository.js';
import { PrismaPersonRepository } from './infrastructure/repositories/prisma-person.repository.js';
import { PrismaSessionRepository } from './infrastructure/repositories/prisma-session.repository.js';
import { JoseTokenService } from './infrastructure/tokens/jose-token.service.js';

export interface IamDependencies {
  personHandlers: PersonRouteHandlers;
  authHandlers: Pick<AuthRouteHandlers, 'registerCredentialHandler'>;
  sessionHandlers: {
    authenticatePersonHandler: AuthRouteHandlers['authenticatePersonHandler'];
    refreshSessionHandler: AuthRouteHandlers['refreshSessionHandler'];
    logoutSessionHandler: AuthRouteHandlers['logoutSessionHandler'];
    validateAccessTokenHandler: ValidateAccessTokenHandlerType;
  };
}

export function createIamDependencies(env: Env): IamDependencies {
  const prisma = getPrismaClient();
  const personRepository = new PrismaPersonRepository(prisma);
  const credentialRepository = new PrismaCredentialRepository(prisma);
  const sessionRepository = new PrismaSessionRepository(prisma);
  const passwordHasher = new Argon2PasswordHasher(buildArgon2Config(env));
  const tokenService = new JoseTokenService(buildJwtConfig(env));

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
    sessionHandlers: {
      authenticatePersonHandler: new AuthenticatePersonHandler(
        personRepository,
        credentialRepository,
        sessionRepository,
        passwordHasher,
        tokenService,
      ),
      refreshSessionHandler: new RefreshSessionHandler(
        sessionRepository,
        tokenService,
      ),
      logoutSessionHandler: new LogoutSessionHandler(sessionRepository),
      validateAccessTokenHandler: new ValidateAccessTokenHandler(
        sessionRepository,
        tokenService,
      ),
    },
  };
}

export async function registerIamModule(
  app: FastifyInstance,
  handlers: PersonRouteHandlers,
): Promise<void> {
  await registerPersonRoutes(app, handlers);
}

export async function registerAuthModule(
  app: FastifyInstance,
  env: Env,
  handlers: AuthRouteHandlers,
): Promise<void> {
  await registerAuthRoutes(app, handlers, env);
}
