import { ApplicationError } from './application-error.js';

export class PermissionAssignmentAlreadyExistsError extends ApplicationError {
  readonly code = 'PERMISSION_ASSIGNMENT_ALREADY_EXISTS' as const;

  constructor(
    readonly roleId: string,
    readonly permissionId: string,
  ) {
    super(
      `Permission assignment for role "${roleId}" and permission "${permissionId}" already exists.`,
    );
    this.name = 'PermissionAssignmentAlreadyExistsError';
  }
}
