import { MembershipInactiveError } from '../../application/errors/membership-inactive.error.js';
import { MembershipNotFoundError } from '../../application/errors/membership-not-found.error.js';
import { RoleAssignmentAlreadyExistsError } from '../../application/errors/role-assignment-already-exists.error.js';
import { RoleAssignmentNotFoundError } from '../../application/errors/role-assignment-not-found.error.js';
import { RoleAssignmentValidationError } from '../../application/errors/role-assignment-validation.error.js';
import { RoleNameAlreadyExistsError } from '../../application/errors/role-name-already-exists.error.js';
import { RoleNotFoundError } from '../../application/errors/role-not-found.error.js';
import { RoleTenantMismatchError } from '../../application/errors/role-tenant-mismatch.error.js';
import { RoleValidationError } from '../../application/errors/role-validation.error.js';
import { TenantInactiveError } from '../../application/errors/tenant-inactive.error.js';
import { TenantNotFoundError } from '../../application/errors/tenant-not-found.error.js';
import {
  GENERIC_INTERNAL_ERROR_MESSAGE,
  type HttpErrorResponse,
} from './map-application-error.js';

export function mapRoleErrorToHttp(error: unknown): HttpErrorResponse {
  if (error instanceof RoleValidationError) {
    return {
      statusCode: 400,
      error: 'Bad Request',
      message: error.message,
    };
  }

  if (error instanceof RoleNotFoundError) {
    return {
      statusCode: 404,
      error: 'Not Found',
      message: error.message,
    };
  }

  if (error instanceof RoleNameAlreadyExistsError) {
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

export function mapRoleAssignmentErrorToHttp(error: unknown): HttpErrorResponse {
  if (error instanceof RoleAssignmentValidationError) {
    return {
      statusCode: 400,
      error: 'Bad Request',
      message: error.message,
    };
  }

  if (error instanceof RoleAssignmentNotFoundError) {
    return {
      statusCode: 404,
      error: 'Not Found',
      message: error.message,
    };
  }

  if (error instanceof RoleAssignmentAlreadyExistsError) {
    return {
      statusCode: 409,
      error: 'Conflict',
      message: error.message,
    };
  }

  if (
    error instanceof RoleTenantMismatchError
    || error instanceof MembershipInactiveError
  ) {
    return {
      statusCode: 403,
      error: 'Forbidden',
      message: error.message,
    };
  }

  if (
    error instanceof MembershipNotFoundError
    || error instanceof RoleNotFoundError
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
