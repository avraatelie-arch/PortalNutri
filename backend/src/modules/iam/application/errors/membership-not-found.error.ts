import { ApplicationError } from './application-error.js';

export class MembershipNotFoundError extends ApplicationError {
  readonly code = 'MEMBERSHIP_NOT_FOUND' as const;

  constructor(
    readonly membershipId?: string,
    readonly personId?: string,
    readonly tenantId?: string,
  ) {
    const message = membershipId
      ? `Membership with id "${membershipId}" was not found.`
      : `Membership for person "${personId}" and tenant "${tenantId}" was not found.`;

    super(message);
    this.name = 'MembershipNotFoundError';
  }
}
