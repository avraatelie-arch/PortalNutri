import { ApplicationError } from './application-error.js';

export class PermissionAssignmentNotFoundError extends ApplicationError {
  readonly code = 'PERMISSION_ASSIGNMENT_NOT_FOUND' as const;

  constructor(
    readonly roleId?: string,
    readonly permissionId?: string,
    readonly permissionAssignmentId?: string,
  ) {
    const message = permissionAssignmentId
      ? `Permission assignment with id "${permissionAssignmentId}" was not found.`
      : `Permission assignment for role "${roleId}" and permission "${permissionId}" was not found.`;

    super(message);
    this.name = 'PermissionAssignmentNotFoundError';
  }
}
