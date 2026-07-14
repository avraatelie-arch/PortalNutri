import { ApplicationError } from './application-error.js';

export class RoleAssignmentAlreadyExistsError extends ApplicationError {
  readonly code = 'ROLE_ASSIGNMENT_ALREADY_EXISTS' as const;

  constructor(
    readonly membershipId: string,
    readonly roleId: string,
  ) {
    super(
      `Role assignment for membership "${membershipId}" and role "${roleId}" already exists.`,
    );
    this.name = 'RoleAssignmentAlreadyExistsError';
  }
}
