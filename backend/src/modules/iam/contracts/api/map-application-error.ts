import { DomainError } from '../../domain/errors/domain-error.js';
import { PersonDocumentAlreadyExistsError } from '../../application/errors/person-document-already-exists.error.js';
import { PersonEmailAlreadyExistsError } from '../../application/errors/person-email-already-exists.error.js';
import { PersonNotFoundError } from '../../application/errors/person-not-found.error.js';

export interface HttpErrorResponse {
  statusCode: number;
  error: string;
  message: string;
}

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

  if (error instanceof DomainError) {
    return {
      statusCode: 400,
      error: 'Bad Request',
      message: error.message,
    };
  }

  return {
    statusCode: 500,
    error: 'Internal Server Error',
    message: 'An unexpected error occurred.',
  };
}
