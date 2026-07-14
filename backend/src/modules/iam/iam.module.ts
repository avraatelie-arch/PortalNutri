import type { FastifyInstance } from 'fastify';
import type { Env } from '../../config/env.js';
import { buildArgon2Config } from '../../config/argon2.js';
import { buildJwtConfig } from '../../config/jwt.js';
import { getPrismaClient } from '../../core/database/prisma-client.js';
import { AuthenticatePersonHandler } from './application/authenticate-person/authenticate-person.handler.js';
import { ActivateTenantHandler } from './application/activate-tenant/activate-tenant.handler.js';
import { CreatePersonHandler } from './application/create-person/create-person.handler.js';
import { CreateTenantHandler } from './application/create-tenant/create-tenant.handler.js';
import { DeactivatePersonHandler } from './application/deactivate-person/deactivate-person.handler.js';
import { DeactivateTenantHandler } from './application/deactivate-tenant/deactivate-tenant.handler.js';
import { FindPersonByIdHandler } from './application/find-person-by-id/find-person-by-id.handler.js';
import { FindTenantHandler } from './application/find-tenant/find-tenant.handler.js';
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
import { PrismaTenantRepository } from './infrastructure/repositories/prisma-tenant.repository.js';
import { JoseTokenService } from './infrastructure/tokens/jose-token.service.js';
import { DefaultAuthorizationService } from './infrastructure/authorization/default-authorization.service.js';
import type { AuthorizationService } from './application/authorization/authorization.service.js';
import { EventDispatcher } from '../../core/application/events/event-dispatcher.js';
import { AuditEventHandler } from '../../core/infrastructure/audit/audit-event-handler.js';
import { DefaultAuditLogger } from '../../core/infrastructure/audit/default-audit-logger.js';
import { DefaultAuditPublisher } from '../../core/infrastructure/audit/default-audit-publisher.js';
import { InMemoryAuditSink } from '../../core/infrastructure/audit/in-memory-audit-sink.js';
import { EventHandlerRegistry } from '../../core/infrastructure/events/event-handler-registry.js';
import { InProcessEventBus } from '../../core/infrastructure/events/in-process-event-bus.js';
import { DefaultEventBusLogger } from '../../core/infrastructure/events/default-event-bus-logger.js';

export interface IamDependencies {
  authorizationService: AuthorizationService;
  eventDispatcher: EventDispatcher;
  personHandlers: PersonRouteHandlers;
  authHandlers: Pick<AuthRouteHandlers, 'registerCredentialHandler'>;
  sessionHandlers: {
    authenticatePersonHandler: AuthRouteHandlers['authenticatePersonHandler'];
    refreshSessionHandler: AuthRouteHandlers['refreshSessionHandler'];
    logoutSessionHandler: AuthRouteHandlers['logoutSessionHandler'];
    validateAccessTokenHandler: ValidateAccessTokenHandlerType;
  };
  tenantHandlers: {
    createTenantHandler: CreateTenantHandler;
    findTenantHandler: FindTenantHandler;
    activateTenantHandler: ActivateTenantHandler;
    deactivateTenantHandler: DeactivateTenantHandler;
  };
}

export function createIamDependencies(env: Env): IamDependencies {
  const prisma = getPrismaClient();
  const personRepository = new PrismaPersonRepository(prisma);
  const credentialRepository = new PrismaCredentialRepository(prisma);
  const sessionRepository = new PrismaSessionRepository(prisma);
  const tenantRepository = new PrismaTenantRepository(prisma);
  const passwordHasher = new Argon2PasswordHasher(buildArgon2Config(env));
  const tokenService = new JoseTokenService(buildJwtConfig(env));
  const eventHandlerRegistry = new EventHandlerRegistry();
  const auditPublisher = new DefaultAuditPublisher(
    new InMemoryAuditSink(),
    new DefaultAuditLogger(),
  );

  eventHandlerRegistry.registerGlobal(new AuditEventHandler(auditPublisher));

  const eventDispatcher = new EventDispatcher(
    new InProcessEventBus(eventHandlerRegistry, new DefaultEventBusLogger()),
  );

  return {
    authorizationService: new DefaultAuthorizationService(),
    eventDispatcher,
    personHandlers: {
      createPersonHandler: new CreatePersonHandler(
        personRepository,
        eventDispatcher,
      ),
      findPersonByIdHandler: new FindPersonByIdHandler(personRepository),
      updatePersonHandler: new UpdatePersonHandler(
        personRepository,
        eventDispatcher,
      ),
      deactivatePersonHandler: new DeactivatePersonHandler(
        personRepository,
        eventDispatcher,
      ),
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
        eventDispatcher,
      ),
      refreshSessionHandler: new RefreshSessionHandler(
        sessionRepository,
        tokenService,
        eventDispatcher,
      ),
      logoutSessionHandler: new LogoutSessionHandler(
        sessionRepository,
        eventDispatcher,
      ),
      validateAccessTokenHandler: new ValidateAccessTokenHandler(
        sessionRepository,
        tokenService,
      ),
    },
    tenantHandlers: {
      createTenantHandler: new CreateTenantHandler(
        tenantRepository,
        eventDispatcher,
      ),
      findTenantHandler: new FindTenantHandler(tenantRepository),
      activateTenantHandler: new ActivateTenantHandler(
        tenantRepository,
        eventDispatcher,
      ),
      deactivateTenantHandler: new DeactivateTenantHandler(
        tenantRepository,
        eventDispatcher,
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
