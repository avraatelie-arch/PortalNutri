import type { AuthorizationContext } from '../authorization/authorization-context.js';

export interface AuthorizationScopeResolver {
  enrich(context: AuthorizationContext): Promise<AuthorizationContext>;
}
