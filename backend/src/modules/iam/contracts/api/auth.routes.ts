import type { FastifyInstance, FastifyReply } from 'fastify';
import type { RegisterCredentialHandler } from '../../application/register-credential/register-credential.handler.js';
import { toRegisterCredentialCommand } from './auth-http.mapper.js';
import { mapAuthErrorToHttp } from './map-auth-error.js';
import {
  registerCredentialBodySchema,
  type RegisterCredentialBody,
} from './schemas/auth.schemas.js';

export interface AuthRouteHandlers {
  registerCredentialHandler: RegisterCredentialHandler;
}

function sendMappedError(reply: FastifyReply, error: unknown) {
  const mapped = mapAuthErrorToHttp(error);

  return reply.status(mapped.statusCode).send({
    statusCode: mapped.statusCode,
    error: mapped.error,
    message: mapped.message,
  });
}

export async function registerAuthRoutes(
  app: FastifyInstance,
  handlers: AuthRouteHandlers,
): Promise<void> {
  app.post(
    '/credentials',
    { schema: { body: registerCredentialBodySchema } },
    async (request, reply) => {
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
