import type { AuthorizationAction } from './authorization-action.js';
import type { AuthorizationResource } from './authorization-resource.js';
import { EMPTY_RESOLVED_TENANT_IDS } from './resolved-tenant-ids.js';

export interface AuthorizationContext {
  personId: string;
  sessionId: string;
  tenantId: string | null;
  resource: AuthorizationResource;
  action: AuthorizationAction;
  resourceId: string | null;
  scopeRefs: Readonly<Record<string, string>>;
  resolvedTenantIds: ReadonlySet<string>;
  resolvedScopeRefCount: number;
}

export function createEmptyAuthorizationContext(
  overrides: Omit<
    AuthorizationContext,
    'scopeRefs' | 'resolvedTenantIds' | 'resolvedScopeRefCount'
  > & {
    scopeRefs?: Readonly<Record<string, string>>;
    resolvedTenantIds?: ReadonlySet<string>;
    resolvedScopeRefCount?: number;
  },
): AuthorizationContext {
  return {
    scopeRefs: {},
    resolvedTenantIds: EMPTY_RESOLVED_TENANT_IDS,
    resolvedScopeRefCount: 0,
    ...overrides,
  };
}
