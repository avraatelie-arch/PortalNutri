import { MembershipAlreadyExistsError } from '../../application/errors/membership-already-exists.error.js';
import { MembershipNotFoundError } from '../../application/errors/membership-not-found.error.js';
import { MembershipValidationError } from '../../application/errors/membership-validation.error.js';
import { PersonInactiveError } from '../../application/errors/person-inactive.error.js';
import { PersonNotFoundError } from '../../application/errors/person-not-found.error.js';
import { TenantInactiveError } from '../../application/errors/tenant-inactive.error.js';
import { TenantNotFoundError } from '../../application/errors/tenant-not-found.error.js';
import {
  GENERIC_INTERNAL_ERROR_MESSAGE,
  type HttpErrorResponse,
} from './map-application-error.js';

export function mapMembershipErrorToHttp(error: unknown): HttpErrorResponse {
  if (error instanceof MembershipValidationError) {
    return {
      statusCode: 400,
      error: 'Bad Request',
      message: error.message,
    };
  }

  if (error instanceof MembershipNotFoundError) {
    return {
      statusCode: 404,
      error: 'Not Found',
      message: error.message,
    };
  }

  if (error instanceof MembershipAlreadyExistsError) {
    return {
      statusCode: 409,
      error: 'Conflict',
      message: error.message,
    };
  }

  if (
    error instanceof PersonInactiveError
    || error instanceof TenantInactiveError
  ) {
    return {
      statusCode: 403,
      error: 'Forbidden',
      message: error.message,
    };
  }

  if (error instanceof PersonNotFoundError || error instanceof TenantNotFoundError) {
    return {
      statusCode: 404,
      error: 'Not Found',
      message: error.message,
    };
  }

  return {
    statusCode: 500,
    error: 'Internal Server Error',
    message: GENERIC_INTERNAL_ERROR_MESSAGE,
  };
}
