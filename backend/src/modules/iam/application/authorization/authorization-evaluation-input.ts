import type { AuthorizationContext } from './authorization-context.js';

export interface AuthorizationEvaluationInput {
  readonly context: AuthorizationContext;
  readonly permissionGranted: boolean;
}
