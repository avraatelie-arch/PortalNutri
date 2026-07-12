import type { FastifyInstance, FastifyReply } from 'fastify';
import type { z } from 'zod';
import type { CreatePersonHandler } from '../../application/create-person/create-person.handler.js';
import { DeactivatePersonCommand } from '../../application/deactivate-person/deactivate-person.command.js';
import type { DeactivatePersonHandler } from '../../application/deactivate-person/deactivate-person.handler.js';
import { FindPersonByIdQuery } from '../../application/find-person-by-id/find-person-by-id.query.js';
import type { FindPersonByIdHandler } from '../../application/find-person-by-id/find-person-by-id.handler.js';
import { UpdatePersonCommand } from '../../application/update-person/update-person.command.js';
import type { UpdatePersonHandler } from '../../application/update-person/update-person.handler.js';
import { mapApplicationErrorToHttp } from './map-application-error.js';
import { toCreatePersonCommand } from './person-http.mapper.js';
import {
  createPersonBodySchema,
  personIdParamsSchema,
  updatePersonBodySchema,
} from './schemas/person.schemas.js';
import type { CreatePersonBody } from './schemas/person.schemas.js';
type UpdatePersonBody = z.infer<typeof updatePersonBodySchema>;

export interface PersonRouteHandlers {
  createPersonHandler: CreatePersonHandler;
  findPersonByIdHandler: FindPersonByIdHandler;
  updatePersonHandler: UpdatePersonHandler;
  deactivatePersonHandler: DeactivatePersonHandler;
}

function sendMappedError(reply: FastifyReply, error: unknown) {
  const mapped = mapApplicationErrorToHttp(error);

  return reply.status(mapped.statusCode).send({
    statusCode: mapped.statusCode,
    error: mapped.error,
    message: mapped.message,
  });
}

export async function registerPersonRoutes(
  app: FastifyInstance,
  handlers: PersonRouteHandlers,
): Promise<void> {
  app.post(
    '/persons',
    { schema: { body: createPersonBodySchema } },
    async (request, reply) => {
      try {
        const body = request.body as CreatePersonBody;
        const response = await handlers.createPersonHandler.execute(
          toCreatePersonCommand(body),
        );

        return reply.status(201).send(response);
      } catch (error) {
        return sendMappedError(reply, error);
      }
    },
  );

  app.get(
    '/persons/:id',
    { schema: { params: personIdParamsSchema } },
    async (request, reply) => {
      try {
        const { id } = request.params as { id: string };
        const result = await handlers.findPersonByIdHandler.execute(
          new FindPersonByIdQuery(id),
        );

        return reply.status(200).send(result);
      } catch (error) {
        return sendMappedError(reply, error);
      }
    },
  );

  app.put(
    '/persons/:id',
    {
      schema: {
        params: personIdParamsSchema,
        body: updatePersonBodySchema,
      },
    },
    async (request, reply) => {
      try {
        const { id } = request.params as { id: string };
        const body = request.body as UpdatePersonBody;
        const result = await handlers.updatePersonHandler.execute(
          new UpdatePersonCommand({
            personId: id,
            ...body,
          }),
        );

        return reply.status(200).send(result);
      } catch (error) {
        return sendMappedError(reply, error);
      }
    },
  );

  app.delete(
    '/persons/:id',
    { schema: { params: personIdParamsSchema } },
    async (request, reply) => {
      try {
        const { id } = request.params as { id: string };
        const result = await handlers.deactivatePersonHandler.execute(
          new DeactivatePersonCommand(id),
        );

        return reply.status(200).send(result);
      } catch (error) {
        return sendMappedError(reply, error);
      }
    },
  );
}
