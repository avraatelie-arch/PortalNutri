import { ApplicationError } from './application-error.js';

export class RoleAssignmentNotFoundError extends ApplicationError {
  readonly code = 'ROLE_ASSIGNMENT_NOT_FOUND' as const;

  constructor(
    readonly membershipId?: string,
    readonly roleId?: string,
    readonly roleAssignmentId?: string,
  ) {
    const message = roleAssignmentId
      ? `Role assignment with id "${roleAssignmentId}" was not found.`
      : `Role assignment for membership "${membershipId}" and role "${roleId}" was not found.`;

    super(message);
    this.name = 'RoleAssignmentNotFoundError';
  }
}
