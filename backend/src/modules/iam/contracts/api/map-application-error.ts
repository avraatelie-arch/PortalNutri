import { PersonDocumentAlreadyExistsError } from '../../application/errors/person-document-already-exists.error.js';
import { PersonEmailAlreadyExistsError } from '../../application/errors/person-email-already-exists.error.js';
import { PersonNotFoundError } from '../../application/errors/person-not-found.error.js';
import { PersonValidationError } from '../../application/errors/person-validation.error.js';
import { TenantNotFoundError } from '../../application/errors/tenant-not-found.error.js';
import { TenantSlugAlreadyExistsError } from '../../application/errors/tenant-slug-already-exists.error.js';
import { TenantValidationError } from '../../application/errors/tenant-validation.error.js';

export interface HttpErrorResponse {
  statusCode: number;
  error: string;
  message: string;
}

export const GENERIC_INTERNAL_ERROR_MESSAGE = 'An unexpected error occurred.';

export function mapApplicationErrorToHttp(error: unknown): HttpErrorResponse {
  if (error instanceof PersonNotFoundError) {
    return {
      statusCode: 404,
      error: 'Not Found',
      message: error.message,
    };
  }

  if (error instanceof PersonEmailAlreadyExistsError) {
    return {
      statusCode: 409,
      error: 'Conflict',
      message: error.message,
    };
  }

  if (error instanceof PersonDocumentAlreadyExistsError) {
    return {
      statusCode: 409,
      error: 'Conflict',
      message: error.message,
    };
  }

  if (error instanceof PersonValidationError) {
    return {
      statusCode: 400,
      error: 'Bad Request',
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

  if (error instanceof TenantSlugAlreadyExistsError) {
    return {
      statusCode: 409,
      error: 'Conflict',
      message: error.message,
    };
  }

  if (error instanceof TenantValidationError) {
    return {
      statusCode: 400,
      error: 'Bad Request',
      message: error.message,
    };
  }

  return {
    statusCode: 500,
    error: 'Internal Server Error',
    message: GENERIC_INTERNAL_ERROR_MESSAGE,
  };
}
