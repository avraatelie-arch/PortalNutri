import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import type { Env } from '../../../../config/env.js';
import type { AuthenticatePersonHandler } from '../../application/authenticate-person/authenticate-person.handler.js';
import type { LogoutSessionHandler } from '../../application/logout-session/logout-session.handler.js';
import type { RefreshSessionHandler } from '../../application/refresh-session/refresh-session.handler.js';
import type { RegisterCredentialHandler } from '../../application/register-credential/register-credential.handler.js';
import { buildUnauthorizedResponse } from '../../../../bootstrap/auth/unauthorized-response.js';
import {
  toAuthenticatePersonCommand,
  toAuthTokenHttpResponse,
  toLogoutSessionCommand,
  toRefreshSessionCommand,
  toRegisterCredentialCommand,
} from './auth-http.mapper.js';
import { mapAuthErrorToHttp } from './map-auth-error.js';
import {
  loginBodySchema,
  refreshBodySchema,
  registerCredentialBodySchema,
  type LoginBody,
  type RefreshBody,
  type RegisterCredentialBody,
} from './schemas/auth.schemas.js';

export interface AuthRouteHandlers {
  registerCredentialHandler: RegisterCredentialHandler;
  authenticatePersonHandler: AuthenticatePersonHandler;
  refreshSessionHandler: RefreshSessionHandler;
  logoutSessionHandler: LogoutSessionHandler;
}

function sendMappedError(reply: FastifyReply, error: unknown) {
  const mapped = mapAuthErrorToHttp(error);

  return reply.status(mapped.statusCode).send({
    statusCode: mapped.statusCode,
    error: mapped.error,
    message: mapped.message,
  });
}

function requireSecurityContext(request: FastifyRequest, reply: FastifyReply) {
  if (!request.securityContext) {
    reply.status(401).send(buildUnauthorizedResponse());
    return null;
  }

  return request.securityContext;
}

export async function registerAuthRoutes(
  app: FastifyInstance,
  handlers: AuthRouteHandlers,
  env: Env,
): Promise<void> {
  app.post(
    '/login',
    {
      schema: {
        body: loginBodySchema,
      },
    },
    async (request, reply) => {
      try {
        const body = request.body as LoginBody;
        const response = await handlers.authenticatePersonHandler.execute(
          toAuthenticatePersonCommand(body),
        );

        return reply.status(200).send(toAuthTokenHttpResponse(response));
      } catch (error) {
        return sendMappedError(reply, error);
      }
    },
  );

  app.post(
    '/refresh',
    {
      schema: {
        body: refreshBodySchema,
      },
    },
    async (request, reply) => {
      try {
        const body = request.body as RefreshBody;
        const response = await handlers.refreshSessionHandler.execute(
          toRefreshSessionCommand(body),
        );

        return reply.status(200).send(toAuthTokenHttpResponse(response));
      } catch (error) {
        return sendMappedError(reply, error);
      }
    },
  );

  app.post(
    '/logout',
    {
      schema: {
        security: [{ bearerAuth: [] }],
      },
    },
    async (request, reply) => {
      const securityContext = requireSecurityContext(request, reply);

      if (!securityContext) {
        return;
      }

      try {
        await handlers.logoutSessionHandler.execute(
          toLogoutSessionCommand(securityContext.sessionId),
        );

        return reply.status(204).send();
      } catch (error) {
        return sendMappedError(reply, error);
      }
    },
  );

  app.get(
    '/me',
    {
      schema: {
        security: [{ bearerAuth: [] }],
      },
    },
    async (request, reply) => {
      const securityContext = requireSecurityContext(request, reply);

      if (!securityContext) {
        return;
      }

      return reply.status(200).send({
        personId: securityContext.personId,
        sessionId: securityContext.sessionId,
        tenantId: securityContext.tenantId,
      });
    },
  );

  app.post(
    '/credentials',
    {
      schema: {
        body: registerCredentialBodySchema,
        description:
          env.AUTH_CREDENTIAL_REGISTRATION_ENABLED
            ? 'Registers credentials for an existing person. Available only when AUTH_CREDENTIAL_REGISTRATION_ENABLED is true.'
            : 'Credential registration is disabled in this environment.',
      },
    },
    async (request, reply) => {
      if (!env.AUTH_CREDENTIAL_REGISTRATION_ENABLED) {
        return reply.status(404).send({
          statusCode: 404,
          error: 'Not Found',
          message: 'Not Found',
        });
      }

      try {
        const body = request.body as RegisterCredentialBody;
        const response = await handlers.registerCredentialHandler.execute(
          toRegisterCredentialCommand(body),
        );

        return reply.status(201).send(response);
      } catch (error) {
        return sendMappedError(reply, error);
      }
    },
  );
}
