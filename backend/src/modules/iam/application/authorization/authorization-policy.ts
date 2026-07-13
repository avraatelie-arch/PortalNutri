import type { AuthorizationContext } from './authorization-context.js';
import type { AuthorizationOutcome } from './authorization-decision.js';

export interface AuthorizationPolicy {
  evaluate(context: AuthorizationContext): AuthorizationOutcome;
}
