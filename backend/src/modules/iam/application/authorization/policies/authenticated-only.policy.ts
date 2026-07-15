import { AuthorizationAction } from '../authorization-action.js';
import type { AuthorizationEvaluationInput } from '../authorization-evaluation-input.js';
import { AuthorizationOutcome } from '../authorization-decision.js';
import type { AuthorizationPolicy } from '../authorization-policy.js';

export class AuthenticatedOnlyPolicy implements AuthorizationPolicy {
  evaluate(input: AuthorizationEvaluationInput): AuthorizationOutcome {
    if (input.context.action === AuthorizationAction.EXECUTE) {
      return AuthorizationOutcome.ALLOW;
    }

    return AuthorizationOutcome.ABSTAIN;
  }
}
