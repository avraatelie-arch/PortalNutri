import type { FastifyRequest } from 'fastify';
import type { AuthorizationContext } from '../../modules/iam/application/authorization/authorization-context.js';
import { AuthorizationAction } from '../../modules/iam/application/authorization/authorization-action.js';
import { AuthorizationResource } from '../../modules/iam/application/authorization/authorization-resource.js';
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
    };
  }

  const resourceId = resolveResourceId(request, metadata.resourceIdParam);

  if (
    metadata.resourceIdParam !== undefined
    && resourceId === null
  ) {
    return null;
  }

  return {
    personId,
    sessionId,
    tenantId,
    resource: metadata.resource,
    action: metadata.action,
    resourceId,
  };
}
