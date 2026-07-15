import type { EventDispatcher } from '../../../core/application/events/event-dispatcher.js';
import type { PasswordHasher } from '../application/ports/password-hasher.port.js';
import type { TokenService } from '../application/ports/token-service.port.js';
import type { CredentialRepository } from '../domain/repositories/credential-repository.js';
import type { MembershipRepository } from '../domain/repositories/membership-repository.js';
import type { PersonRepository } from '../domain/repositories/person-repository.js';
import type { SessionRepository } from '../domain/repositories/session-repository.js';
import type { TenantRepository } from '../domain/repositories/tenant-repository.js';
import { AuthenticatePersonHandler } from '../application/authenticate-person/authenticate-person.handler.js';
import { LogoutSessionHandler } from '../application/logout-session/logout-session.handler.js';
import { RefreshSessionHandler } from '../application/refresh-session/refresh-session.handler.js';
import { RegisterCredentialHandler } from '../application/register-credential/register-credential.handler.js';
import { SelectTenantHandler } from '../application/select-tenant/select-tenant.handler.js';
import { ValidateAccessTokenHandler } from '../application/validate-access-token/validate-access-token.handler.js';

export interface AuthenticationFactoryDependencies {
  personRepository: PersonRepository;
  credentialRepository: CredentialRepository;
  sessionRepository: SessionRepository;
  membershipRepository: MembershipRepository;
  tenantRepository: TenantRepository;
  passwordHasher: PasswordHasher;
  tokenService: TokenService;
  eventDispatcher: EventDispatcher;
}

export interface AuthenticationHandlers {
  registerCredentialHandler: RegisterCredentialHandler;
  authenticatePersonHandler: AuthenticatePersonHandler;
  refreshSessionHandler: RefreshSessionHandler;
  logoutSessionHandler: LogoutSessionHandler;
  selectTenantHandler: SelectTenantHandler;
  validateAccessTokenHandler: ValidateAccessTokenHandler;
}

export function createAuthenticationHandlers({
  personRepository,
  credentialRepository,
  sessionRepository,
  membershipRepository,
  tenantRepository,
  passwordHasher,
  tokenService,
  eventDispatcher,
}: AuthenticationFactoryDependencies): AuthenticationHandlers {
  return {
    registerCredentialHandler: new RegisterCredentialHandler(
      personRepository,
      credentialRepository,
      passwordHasher,
    ),
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
    selectTenantHandler: new SelectTenantHandler(
      sessionRepository,
      tenantRepository,
      membershipRepository,
      eventDispatcher,
    ),
    validateAccessTokenHandler: new ValidateAccessTokenHandler(
      sessionRepository,
      tokenService,
    ),
  };
}
