import { ApplicationError } from './application-error.js';

export class MembershipAlreadyExistsError extends ApplicationError {
  readonly code = 'MEMBERSHIP_ALREADY_EXISTS' as const;

  constructor(
    readonly personId: string,
    readonly tenantId: string,
  ) {
    super(
      `Membership for person "${personId}" and tenant "${tenantId}" already exists.`,
    );
    this.name = 'MembershipAlreadyExistsError';
  }
}
