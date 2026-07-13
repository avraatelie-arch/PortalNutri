import type { FastifyInstance } from 'fastify';
import type { Env } from '../../config/env.js';
import { ValidateAccessTokenQuery } from '../../modules/iam/application/validate-access-token/validate-access-token.query.js';
import type { ValidateAccessTokenHandler } from '../../modules/iam/application/validate-access-token/validate-access-token.handler.js';
import { extractBearerToken } from './extract-bearer-token.js';
import { isPublicRoute } from './public-routes.js';
import { buildUnauthorizedResponse } from '../../modules/iam/application/authentication/unauthorized-response.js';

export function registerAuthentication(
  app: FastifyInstance,
  env: Env,
  validateAccessTokenHandler: ValidateAccessTokenHandler,
): void {
  app.decorateRequest('securityContext', null);

  app.addHook('onRequest', async (request, reply) => {
    request.securityContext = null;

    if (
      isPublicRoute(
        request.method,
        request.url,
        env.AUTH_CREDENTIAL_REGISTRATION_ENABLED,
      )
    ) {
      return;
    }

    const accessToken = extractBearerToken(request.headers.authorization);

    if (!accessToken) {
      return reply.status(401).send(buildUnauthorizedResponse());
    }

    try {
      const result = await validateAccessTokenHandler.execute(
        new ValidateAccessTokenQuery({ accessToken }),
      );

      request.securityContext = result.securityContext;
    }
    catch {
      return reply.status(401).send(buildUnauthorizedResponse());
    }
  });
}
