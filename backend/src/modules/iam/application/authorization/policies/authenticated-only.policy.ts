import type { AuthorizationContext } from '../authorization-context.js';
import { AuthorizationOutcome } from '../authorization-decision.js';
import type { AuthorizationPolicy } from '../authorization-policy.js';

export class AuthenticatedOnlyPolicy implements AuthorizationPolicy {
  evaluate(_context: AuthorizationContext): AuthorizationOutcome {
    return AuthorizationOutcome.ALLOW;
  }
}
