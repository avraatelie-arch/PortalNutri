import type { AuthenticatePersonResult } from '../../application/authenticate-person/authenticate-person.response.js';
import { AuthenticatePersonCommand } from '../../application/authenticate-person/authenticate-person.command.js';
import { LogoutSessionCommand } from '../../application/logout-session/logout-session.command.js';
import type { RefreshSessionResult } from '../../application/refresh-session/refresh-session.response.js';
import { RefreshSessionCommand } from '../../application/refresh-session/refresh-session.command.js';
import { RegisterCredentialCommand } from '../../application/register-credential/register-credential.command.js';
import type { LoginBody, RefreshBody, RegisterCredentialBody } from './schemas/auth.schemas.js';

export function toRegisterCredentialCommand(
  body: RegisterCredentialBody,
): RegisterCredentialCommand {
  return new RegisterCredentialCommand({
    personId: body.personId,
    password: body.password,
  });
}

export function toAuthenticatePersonCommand(
  body: LoginBody,
): AuthenticatePersonCommand {
  return new AuthenticatePersonCommand({
    email: body.email,
    password: body.password,
  });
}

export function toRefreshSessionCommand(
  body: RefreshBody,
): RefreshSessionCommand {
  return new RefreshSessionCommand({
    refreshToken: body.refreshToken,
  });
}

export function toLogoutSessionCommand(
  sessionId: string,
): LogoutSessionCommand {
  return new LogoutSessionCommand({ sessionId });
}

export function toAuthTokenHttpResponse(
  result: AuthenticatePersonResult | RefreshSessionResult,
) {
  return {
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
    expiresAt: result.accessTokenExpiresAt.toISOString(),
    sessionId: result.sessionId,
  };
}
