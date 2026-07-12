import { CredentialAlreadyExistsError } from '../../application/errors/credential-already-exists.error.js';
import { PersonInactiveError } from '../../application/errors/person-inactive.error.js';
import { mapApplicationErrorToHttp } from './map-application-error.js';

export function mapAuthErrorToHttp(error: unknown) {
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

  return mapApplicationErrorToHttp(error);
}
