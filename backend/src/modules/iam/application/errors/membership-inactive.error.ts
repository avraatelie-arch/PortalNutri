import { ApplicationError } from './application-error.js';

export class MembershipInactiveError extends ApplicationError {
  readonly code = 'MEMBERSHIP_INACTIVE' as const;

  constructor(readonly membershipId: string) {
    super(`Membership with id "${membershipId}" is inactive.`);
    this.name = 'MembershipInactiveError';
  }
}
