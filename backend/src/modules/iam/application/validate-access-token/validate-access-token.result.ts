import type { SecurityContext } from '../security-context.js';

export class ValidateAccessTokenResult {
  private constructor(readonly securityContext: SecurityContext) {}

  static from(securityContext: SecurityContext): ValidateAccessTokenResult {
    return new ValidateAccessTokenResult(securityContext);
  }
}
