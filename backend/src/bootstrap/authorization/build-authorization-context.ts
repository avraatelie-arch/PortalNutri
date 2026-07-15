import type { FastifyRequest } from 'fastify';
import type { AuthorizationContext } from '../../modules/iam/application/authorization/authorization-context.js';
import { AuthorizationAction } from '../../modules/iam/application/authorization/authorization-action.js';
import { AuthorizationResource } from '../../modules/iam/application/authorization/authorization-resource.js';
import { EMPTY_RESOLVED_TENANT_IDS } from '../../modules/iam/application/authorization/resolved-tenant-ids.js';
import type { SecurityContext } from '../../modules/iam/application/security-context.js';
import {
  isAuthenticatedOnlyMetadata,
  type RouteAuthorizationMetadata,
} from './route-authorization-metadata.js';

function isValidSecurityContext(
  securityContext: SecurityContext | null,
): securityContext is SecurityContext {
  return (
    securityContext !== null
    && typeof securityContext.personId === 'string'
    && securityContext.personId.length > 0
    && typeof securityContext.sessionId === 'string'
    && securityContext.sessionId.length > 0
    && (securityContext.tenantId === null
      || typeof securityContext.tenantId === 'string')
  );
}

function resolveResourceId(
  request: FastifyRequest,
  resourceIdParam: string | undefined,
): string | null {
  if (!resourceIdParam) {
    return null;
  }

  const params = request.params;

  if (
    typeof params !== 'object'
    || params === null
    || !(resourceIdParam in params)
  ) {
    return null;
  }

  const resourceId = (params as Record<string, unknown>)[resourceIdParam];

  if (typeof resourceId !== 'string' || resourceId.length === 0) {
    return null;
  }

  return resourceId;
}

function resolveStringField(
  source: unknown,
  fieldName: string,
): string | null {
  if (typeof source !== 'object' || source === null || !(fieldName in source)) {
    return null;
  }

  const value = (source as Record<string, unknown>)[fieldName];

  if (typeof value !== 'string' || value.length === 0) {
    return null;
  }

  return value;
}

function resolveScopeRefs(
  source: unknown,
  fieldNames: string[] | undefined,
): Record<string, string> {
  if (!fieldNames || fieldNames.length === 0) {
    return {};
  }

  const refs: Record<string, string> = {};

  for (const fieldName of fieldNames) {
    const value = resolveStringField(source, fieldName);

    if (value) {
      refs[fieldName] = value;
    }
  }

  return refs;
}

function resolveDirectTenantIds(
  request: FastifyRequest,
  metadata: RouteAuthorizationMetadata,
): Set<string> {
  const tenantIds = new Set<string>();

  if (isAuthenticatedOnlyMetadata(metadata)) {
    return tenantIds;
  }

  if (metadata.scopeTenantIdFromBody !== undefined) {
    const tenantId = resolveStringField(
      request.body,
      metadata.scopeTenantIdFromBody,
    );

    if (tenantId) {
      tenantIds.add(tenantId);
    }
  }

  if (metadata.scopeTenantIdFromParam !== undefined) {
    const tenantId = resolveResourceId(
      request,
      metadata.scopeTenantIdFromParam,
    );

    if (tenantId) {
      tenantIds.add(tenantId);
    }
  }

  return tenantIds;
}

export function buildAuthorizationContext(
  request: FastifyRequest,
  metadata: RouteAuthorizationMetadata,
): AuthorizationContext | null {
  if (!isValidSecurityContext(request.securityContext)) {
    return null;
  }

  const { personId, sessionId, tenantId } = request.securityContext;

  if (isAuthenticatedOnlyMetadata(metadata)) {
    return {
      personId,
      sessionId,
      tenantId,
      resource: AuthorizationResource.PERSON,
      action: AuthorizationAction.EXECUTE,
      resourceId: null,
      scopeRefs: {},
      resolvedTenantIds: EMPTY_RESOLVED_TENANT_IDS,
      resolvedScopeRefCount: 0,
    };
  }

  const resourceId = resolveResourceId(request, metadata.resourceIdParam);
  const scopeRefs = {
    ...resolveScopeRefs(request.body, metadata.scopeRefsFromBody),
    ...resolveScopeRefs(request.params, metadata.scopeRefsFromParams),
  };
  const resolvedTenantIds = resolveDirectTenantIds(request, metadata);

  if (metadata.scopeTenantIdFromBody !== undefined) {
    const tenantId = resolveStringField(
      request.body,
      metadata.scopeTenantIdFromBody,
    );

    if (tenantId) {
      scopeRefs[metadata.scopeTenantIdFromBody] = tenantId;
    }
  }

  if (metadata.scopeTenantIdFromParam !== undefined) {
    const tenantId = resolveResourceId(
      request,
      metadata.scopeTenantIdFromParam,
    );

    if (tenantId) {
      scopeRefs[metadata.scopeTenantIdFromParam] = tenantId;
    }
  }

  if (
    metadata.resourceIdParam !== undefined
    && resourceId === null
  ) {
    return null;
  }

  if (
    metadata.scopeTenantIdFromBody !== undefined
    && resolveStringField(request.body, metadata.scopeTenantIdFromBody) === null
  ) {
    return null;
  }

  if (
    metadata.scopeTenantIdFromParam !== undefined
    && resolveResourceId(request, metadata.scopeTenantIdFromParam) === null
  ) {
    return null;
  }

  if (metadata.scopeRefsFromBody !== undefined) {
    for (const fieldName of metadata.scopeRefsFromBody) {
      if (!(fieldName in scopeRefs)) {
        return null;
      }
    }
  }

  if (metadata.scopeRefsFromParams !== undefined) {
    for (const fieldName of metadata.scopeRefsFromParams) {
      if (!(fieldName in scopeRefs)) {
        return null;
      }
    }
  }

  return {
    personId,
    sessionId,
    tenantId,
    resource: metadata.resource,
    action: metadata.action,
    resourceId,
    scopeRefs,
    resolvedTenantIds,
    resolvedScopeRefCount: resolvedTenantIds.size,
  };
}
