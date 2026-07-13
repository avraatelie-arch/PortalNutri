import type { AuthorizationContext } from './authorization-context.js';
import { AuthorizationOutcome } from './authorization-decision.js';
import type { AuthorizationPolicy } from './authorization-policy.js';

export class AuthorizationEngine {
  constructor(private readonly policies: AuthorizationPolicy[]) {}

  authorize(context: AuthorizationContext): AuthorizationOutcome {
    const outcomes = this.policies.map((policy) => policy.evaluate(context));

    if (outcomes.includes(AuthorizationOutcome.DENY)) {
      return AuthorizationOutcome.DENY;
    }

    if (outcomes.includes(AuthorizationOutcome.ALLOW)) {
      return AuthorizationOutcome.ALLOW;
    }

    return AuthorizationOutcome.DENY;
  }
}
