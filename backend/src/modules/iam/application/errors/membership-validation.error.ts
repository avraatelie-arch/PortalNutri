import { ApplicationError } from './application-error.js';

export class MembershipValidationError extends ApplicationError {
  readonly code = 'MEMBERSHIP_VALIDATION_FAILED' as const;

  constructor(message: string) {
    super(message);
    this.name = 'MembershipValidationError';
  }
}
