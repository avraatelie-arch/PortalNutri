import type { AuthorizationEvaluationInput } from './authorization-evaluation-input.js';
import type { AuthorizationOutcome } from './authorization-decision.js';

export interface AuthorizationPolicy {
  evaluate(input: AuthorizationEvaluationInput): AuthorizationOutcome;
}
