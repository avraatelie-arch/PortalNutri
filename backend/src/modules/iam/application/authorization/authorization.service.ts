import type { AuthorizationContext } from './authorization-context.js';
import type { AuthorizationOutcome } from './authorization-decision.js';

export interface AuthorizationService {
  authorize(context: AuthorizationContext): AuthorizationOutcome;
}
