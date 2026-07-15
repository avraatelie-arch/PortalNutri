import type { AuthorizationContext } from './authorization-context.js';
import { AuthorizationOutcome } from './authorization-decision.js';

export function evaluateResolvedTenantScope(
  context: AuthorizationContext,
  minimumResolvedTenants: number,
): AuthorizationOutcome {
  if (context.tenantId === null) {
    return AuthorizationOutcome.DENY;
  }

  if (context.resolvedScopeRefCount < minimumResolvedTenants) {
    return AuthorizationOutcome.DENY;
  }

  if (context.resolvedTenantIds.size === 0) {
    return AuthorizationOutcome.DENY;
  }

  for (const resolvedTenantId of context.resolvedTenantIds) {
    if (resolvedTenantId !== context.tenantId) {
      return AuthorizationOutcome.DENY;
    }
  }

  return AuthorizationOutcome.ABSTAIN;
}
