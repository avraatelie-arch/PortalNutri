import { CredentialAlreadyExistsError } from '../../application/errors/credential-already-exists.error.js';
import { InvalidAccessTokenError } from '../../application/errors/invalid-access-token.error.js';
import { InvalidCredentialsError } from '../../application/errors/invalid-credentials.error.js';
import { InvalidRefreshTokenError } from '../../application/errors/invalid-refresh-token.error.js';
import { PersonInactiveError } from '../../application/errors/person-inactive.error.js';
import { UNAUTHORIZED_MESSAGE } from '../../application/authentication/unauthorized-response.js';
import { SessionExpiredError } from '../../application/errors/session-expired.error.js';
import { SessionNotFoundError } from '../../application/errors/session-not-found.error.js';
import { SessionRevokedError } from '../../application/errors/session-revoked.error.js';
import { FORBIDDEN_MESSAGE } from '../../application/authorization/forbidden-response.js';
import { MembershipInactiveError } from '../../application/errors/membership-inactive.error.js';
import { MembershipNotFoundError } from '../../application/errors/membership-not-found.error.js';
import { TenantInactiveError } from '../../application/errors/tenant-inactive.error.js';
import { TenantNotFoundError } from '../../application/errors/tenant-not-found.error.js';
import { mapApplicationErrorToHttp } from './map-application-error.js';

function isAuthenticationFailure(error: unknown): boolean {
  return (
    error instanceof InvalidCredentialsError
    || error instanceof InvalidRefreshTokenError
    || error instanceof InvalidAccessTokenError
    || error instanceof SessionNotFoundError
    || error instanceof SessionExpiredError
    || error instanceof SessionRevokedError
  );
}

export function mapAuthErrorToHttp(error: unknown) {
  if (isAuthenticationFailure(error)) {
    return {
      statusCode: 401,
      error: 'Unauthorized',
      message: UNAUTHORIZED_MESSAGE,
    };
  }

  if (error instanceof CredentialAlreadyExistsError) {
    return {
      statusCode: 409,
      error: 'Conflict',
      message: error.message,
    };
  }

  if (error instanceof PersonInactiveError) {
    return {
      statusCode: 403,
      error: 'Forbidden',
      message: error.message,
    };
  }

  if (error instanceof TenantNotFoundError) {
    return {
      statusCode: 404,
      error: 'Not Found',
      message: error.message,
    };
  }

  if (
    error instanceof TenantInactiveError
    || error instanceof MembershipInactiveError
    || error instanceof MembershipNotFoundError
  ) {
    return {
      statusCode: 403,
      error: 'Forbidden',
      message: FORBIDDEN_MESSAGE,
    };
  }

  return mapApplicationErrorToHttp(error);
}
