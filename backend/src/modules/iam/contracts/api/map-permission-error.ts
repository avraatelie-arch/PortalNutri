import { PermissionAssignmentAlreadyExistsError } from '../../application/errors/permission-assignment-already-exists.error.js';
import { PermissionAssignmentNotFoundError } from '../../application/errors/permission-assignment-not-found.error.js';
import { PermissionAssignmentValidationError } from '../../application/errors/permission-assignment-validation.error.js';
import { PermissionNameAlreadyExistsError } from '../../application/errors/permission-name-already-exists.error.js';
import { PermissionNotFoundError } from '../../application/errors/permission-not-found.error.js';
import { PermissionTenantMismatchError } from '../../application/errors/permission-tenant-mismatch.error.js';
import { PermissionValidationError } from '../../application/errors/permission-validation.error.js';
import { RoleNotFoundError } from '../../application/errors/role-not-found.error.js';
import { TenantInactiveError } from '../../application/errors/tenant-inactive.error.js';
import { TenantNotFoundError } from '../../application/errors/tenant-not-found.error.js';
import {
  GENERIC_INTERNAL_ERROR_MESSAGE,
  type HttpErrorResponse,
} from './map-application-error.js';

export function mapPermissionErrorToHttp(error: unknown): HttpErrorResponse {
  if (error instanceof PermissionValidationError) {
    return {
      statusCode: 400,
      error: 'Bad Request',
      message: error.message,
    };
  }

  if (error instanceof PermissionNotFoundError) {
    return {
      statusCode: 404,
      error: 'Not Found',
      message: error.message,
    };
  }

  if (error instanceof PermissionNameAlreadyExistsError) {
    return {
      statusCode: 409,
      error: 'Conflict',
      message: error.message,
    };
  }

  if (error instanceof TenantInactiveError) {
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

  return {
    statusCode: 500,
    error: 'Internal Server Error',
    message: GENERIC_INTERNAL_ERROR_MESSAGE,
  };
}

export function mapPermissionAssignmentErrorToHttp(
  error: unknown,
): HttpErrorResponse {
  if (error instanceof PermissionAssignmentValidationError) {
    return {
      statusCode: 400,
      error: 'Bad Request',
      message: error.message,
    };
  }

  if (error instanceof PermissionAssignmentNotFoundError) {
    return {
      statusCode: 404,
      error: 'Not Found',
      message: error.message,
    };
  }

  if (error instanceof PermissionAssignmentAlreadyExistsError) {
    return {
      statusCode: 409,
      error: 'Conflict',
      message: error.message,
    };
  }

  if (error instanceof PermissionTenantMismatchError) {
    return {
      statusCode: 403,
      error: 'Forbidden',
      message: error.message,
    };
  }

  if (
    error instanceof RoleNotFoundError
    || error instanceof PermissionNotFoundError
  ) {
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
