import type { AuthorizationAction } from './authorization-action.js';
import type { AuthorizationResource } from './authorization-resource.js';

export interface AuthorizationContext {
  personId: string;
  sessionId: string;
  tenantId: string | null;
  resource: AuthorizationResource;
  action: AuthorizationAction;
  resourceId: string | null;
  scopeTenantId: string | null;
  resourceTenantId: string | null;
}
