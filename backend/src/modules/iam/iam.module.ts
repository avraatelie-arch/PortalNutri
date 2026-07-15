import type { FastifyInstance } from 'fastify';
import type { Env } from '../../config/env.js';
import { buildArgon2Config } from '../../config/argon2.js';
import { buildJwtConfig } from '../../config/jwt.js';
import { getPrismaClient } from '../../core/database/prisma-client.js';
import type { ValidateAccessTokenHandler as ValidateAccessTokenHandlerType } from './application/validate-access-token/validate-access-token.handler.js';
import { createAuthenticationHandlers } from './composition/authentication.factory.js';
import { createMembershipHandlers } from './composition/membership.factory.js';
import type { MembershipHandlers } from './composition/membership.factory.js';
import { createPermissionHandlers } from './composition/permission.factory.js';
import type { PermissionHandlers } from './composition/permission.factory.js';
import { createPersonHandlers } from './composition/person.factory.js';
import { createRoleHandlers } from './composition/role.factory.js';
import type { RoleHandlers } from './composition/role.factory.js';
import { createTenantHandlers } from './composition/tenant.factory.js';
import type { TenantHandlers } from './composition/tenant.factory.js';
import { registerAuthRoutes } from './contracts/api/auth.routes.js';
import type { AuthRouteHandlers } from './contracts/api/auth.routes.js';
import { registerPersonRoutes } from './contracts/api/person.routes.js';
import type { PersonRouteHandlers } from './contracts/api/person.routes.js';
import { registerMembershipRoutes } from './contracts/api/membership.routes.js';
import type { MembershipRouteHandlers } from './contracts/api/membership.routes.js';
import { registerPermissionRoutes } from './contracts/api/permission.routes.js';
import type { PermissionRouteHandlers } from './contracts/api/permission.routes.js';
import { registerRoleRoutes } from './contracts/api/role.routes.js';
import type { RoleRouteHandlers } from './contracts/api/role.routes.js';
import { registerTenantRoutes } from './contracts/api/tenant.routes.js';
import type { TenantRouteHandlers } from './contracts/api/tenant.routes.js';
import { Argon2PasswordHasher } from './infrastructure/cryptography/argon2-password-hasher.js';
import { PrismaCredentialRepository } from './infrastructure/repositories/prisma-credential.repository.js';
import { PrismaMembershipRepository } from './infrastructure/repositories/prisma-membership.repository.js';
import { PrismaPermissionAssignmentRepository } from './infrastructure/repositories/prisma-permission-assignment.repository.js';
import { PrismaPermissionRepository } from './infrastructure/repositories/prisma-permission.repository.js';
import { PrismaPersonRepository } from './infrastructure/repositories/prisma-person.repository.js';
import { PrismaRoleAssignmentRepository } from './infrastructure/repositories/prisma-role-assignment.repository.js';
import { PrismaRoleRepository } from './infrastructure/repositories/prisma-role.repository.js';
import { PrismaSessionRepository } from './infrastructure/repositories/prisma-session.repository.js';
import { PrismaTenantRepository } from './infrastructure/repositories/prisma-tenant.repository.js';
import { JoseTokenService } from './infrastructure/tokens/jose-token.service.js';
import { createAuthorizationService } from './composition/authorization.factory.js';
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
    selectTenantHandler: AuthRouteHandlers['selectTenantHandler'];
    validateAccessTokenHandler: ValidateAccessTokenHandlerType;
  };
  tenantHandlers: TenantHandlers;
  membershipHandlers: MembershipHandlers;
  roleHandlers: RoleHandlers;
  permissionHandlers: PermissionHandlers;
}

export function createIamDependencies(env: Env): IamDependencies {
  const prisma = getPrismaClient();
  const personRepository = new PrismaPersonRepository(prisma);
  const credentialRepository = new PrismaCredentialRepository(prisma);
  const sessionRepository = new PrismaSessionRepository(prisma);
  const tenantRepository = new PrismaTenantRepository(prisma);
  const membershipRepository = new PrismaMembershipRepository(prisma);
  const roleRepository = new PrismaRoleRepository(prisma);
  const roleAssignmentRepository = new PrismaRoleAssignmentRepository(prisma);
  const permissionRepository = new PrismaPermissionRepository(prisma);
  const permissionAssignmentRepository = new PrismaPermissionAssignmentRepository(prisma);
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

  const authenticationHandlers = createAuthenticationHandlers({
    personRepository,
    credentialRepository,
    sessionRepository,
    membershipRepository,
    tenantRepository,
    passwordHasher,
    tokenService,
    eventDispatcher,
  });

  return {
    authorizationService: createAuthorizationService({
      membershipRepository,
      roleAssignmentRepository,
      roleRepository,
      permissionAssignmentRepository,
      permissionRepository,
    }),
    eventDispatcher,
    personHandlers: createPersonHandlers({
      personRepository,
      eventDispatcher,
    }),
    authHandlers: {
      registerCredentialHandler: authenticationHandlers.registerCredentialHandler,
    },
    sessionHandlers: {
      authenticatePersonHandler: authenticationHandlers.authenticatePersonHandler,
      refreshSessionHandler: authenticationHandlers.refreshSessionHandler,
      logoutSessionHandler: authenticationHandlers.logoutSessionHandler,
      selectTenantHandler: authenticationHandlers.selectTenantHandler,
      validateAccessTokenHandler: authenticationHandlers.validateAccessTokenHandler,
    },
    tenantHandlers: createTenantHandlers({
      tenantRepository,
      eventDispatcher,
    }),
    membershipHandlers: createMembershipHandlers({
      membershipRepository,
      personRepository,
      tenantRepository,
      eventDispatcher,
    }),
    roleHandlers: createRoleHandlers({
      roleRepository,
      roleAssignmentRepository,
      membershipRepository,
      tenantRepository,
      eventDispatcher,
    }),
    permissionHandlers: createPermissionHandlers({
      permissionRepository,
      permissionAssignmentRepository,
      roleRepository,
      tenantRepository,
      eventDispatcher,
    }),
  };
}

export async function registerIamModule(
  app: FastifyInstance,
  handlers: PersonRouteHandlers,
): Promise<void> {
  await registerPersonRoutes(app, handlers);
}

export async function registerTenantModule(
  app: FastifyInstance,
  handlers: TenantRouteHandlers,
): Promise<void> {
  await registerTenantRoutes(app, handlers);
}

export async function registerMembershipModule(
  app: FastifyInstance,
  handlers: MembershipRouteHandlers,
): Promise<void> {
  await registerMembershipRoutes(app, handlers);
}

export async function registerRoleModule(
  app: FastifyInstance,
  handlers: RoleRouteHandlers,
): Promise<void> {
  await registerRoleRoutes(app, handlers);
}

export async function registerPermissionModule(
  app: FastifyInstance,
  handlers: PermissionRouteHandlers,
): Promise<void> {
  await registerPermissionRoutes(app, handlers);
}

export async function registerAuthModule(
  app: FastifyInstance,
  env: Env,
  handlers: AuthRouteHandlers,
): Promise<void> {
  await registerAuthRoutes(app, handlers, env);
}
