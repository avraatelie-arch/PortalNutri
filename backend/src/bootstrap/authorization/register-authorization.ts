import type { FastifyInstance, FastifyRequest } from 'fastify';
import type { Env } from '../../config/env.js';
import { AuthorizationOutcome } from '../../modules/iam/application/authorization/authorization-decision.js';
import { buildForbiddenResponse } from '../../modules/iam/application/authorization/forbidden-response.js';
import type { AuthorizationService } from '../../modules/iam/application/authorization/authorization.service.js';
import { isPublicRoute } from '../security/public-routes.js';
import { buildAuthorizationContext } from './build-authorization-context.js';
import type { RouteAuthorizationMetadata } from './route-authorization-metadata.js';

function resolveRouteAuthorizationMetadata(
  request: FastifyRequest,
): RouteAuthorizationMetadata | null {
  const metadata = request.routeOptions.config?.authorization;

  if (metadata === undefined || metadata === null) {
    return null;
  }

  return metadata as RouteAuthorizationMetadata;
}

export function registerAuthorization(
  app: FastifyInstance,
  env: Env,
  authorizationService: AuthorizationService,
): void {
  app.decorateRequest('authorizationContext', null);

  app.addHook('preHandler', async (request, reply) => {
    request.authorizationContext = null;

    if (reply.sent) {
      return;
    }

    if (
      isPublicRoute(
        request.method,
        request.url,
        env.AUTH_CREDENTIAL_REGISTRATION_ENABLED,
      )
    ) {
      return;
    }

    const metadata = resolveRouteAuthorizationMetadata(request);

    if (metadata === null) {
      request.log.warn(
        {
          method: request.method,
          url: request.url,
        },
        'Authorization denied: protected route without metadata',
      );
      return reply.status(403).send(buildForbiddenResponse());
    }

    const authorizationContext = buildAuthorizationContext(request, metadata);

    if (authorizationContext === null) {
      request.log.warn(
        {
          method: request.method,
          url: request.url,
        },
        'Authorization denied: malformed authorization context',
      );
      return reply.status(403).send(buildForbiddenResponse());
    }

    try {
      const outcome = await authorizationService.authorize(authorizationContext);

      if (outcome !== AuthorizationOutcome.ALLOW) {
        request.log.warn(
          {
            method: request.method,
            url: request.url,
            personId: authorizationContext.personId,
            resource: authorizationContext.resource,
            action: authorizationContext.action,
          },
          'Authorization denied by policy evaluation',
        );
        return reply.status(403).send(buildForbiddenResponse());
      }

      request.authorizationContext = authorizationContext;
    }
    catch (error) {
      request.log.error(
        {
          err: error,
          method: request.method,
          url: request.url,
        },
        'Authorization denied due to evaluation error',
      );
      return reply.status(403).send(buildForbiddenResponse());
    }
  });
}
