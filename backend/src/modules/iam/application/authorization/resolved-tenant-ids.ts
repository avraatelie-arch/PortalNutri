import type { AuthorizationContext } from './authorization-context.js';

export const EMPTY_RESOLVED_TENANT_IDS: ReadonlySet<string> = new Set();

export function withResolvedTenantIds(
  context: AuthorizationContext,
  tenantIds: Iterable<string | null | undefined>,
): AuthorizationContext {
  const next = new Set(context.resolvedTenantIds);
  let resolvedScopeRefCount = context.resolvedScopeRefCount;

  for (const tenantId of tenantIds) {
    if (tenantId) {
      next.add(tenantId);
      resolvedScopeRefCount += 1;
    }
  }

  return {
    ...context,
    resolvedTenantIds: next,
    resolvedScopeRefCount,
  };
}
