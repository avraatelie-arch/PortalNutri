import type { AuthorizationAction } from '../../modules/iam/application/authorization/authorization-action.js';
import type { AuthorizationResource } from '../../modules/iam/application/authorization/authorization-resource.js';

export interface AuthenticatedOnlyRouteAuthorization {
  authenticatedOnly: true;
}

export interface ResourceRouteAuthorization {
  resource: AuthorizationResource;
  action: AuthorizationAction;
  resourceIdParam?: string;
  scopeTenantIdFromBody?: string;
  scopeTenantIdFromParam?: string;
  scopeRefsFromBody?: string[];
  scopeRefsFromParams?: string[];
  resolveResourceTenantFromId?: boolean;
}

export type RouteAuthorizationMetadata =
  | AuthenticatedOnlyRouteAuthorization
  | ResourceRouteAuthorization;

export function isAuthenticatedOnlyMetadata(
  metadata: RouteAuthorizationMetadata,
): metadata is AuthenticatedOnlyRouteAuthorization {
  return 'authenticatedOnly' in metadata && metadata.authenticatedOnly === true;
}
