import type { FastifyInstance, FastifyReply } from 'fastify';
import type { ActivateTenantHandler } from '../../application/activate-tenant/activate-tenant.handler.js';
import { ActivateTenantCommand } from '../../application/activate-tenant/activate-tenant.command.js';
import type { CreateTenantHandler } from '../../application/create-tenant/create-tenant.handler.js';
import type { DeactivateTenantHandler } from '../../application/deactivate-tenant/deactivate-tenant.handler.js';
import { DeactivateTenantCommand } from '../../application/deactivate-tenant/deactivate-tenant.command.js';
import type { FindTenantHandler } from '../../application/find-tenant/find-tenant.handler.js';
import { FindTenantQuery } from '../../application/find-tenant/find-tenant.query.js';
import { AuthorizationAction } from '../../application/authorization/authorization-action.js';
import { AuthorizationResource } from '../../application/authorization/authorization-resource.js';
import { mapApplicationErrorToHttp } from './map-application-error.js';
import { toCreateTenantCommand } from './tenant-http.mapper.js';
import {
  createTenantBodySchema,
  httpErrorResponseSchema,
  tenantIdParamsSchema,
  type CreateTenantBody,
} from './schemas/tenant.schemas.js';

export interface TenantRouteHandlers {
  createTenantHandler: CreateTenantHandler;
  findTenantHandler: FindTenantHandler;
  activateTenantHandler: ActivateTenantHandler;
  deactivateTenantHandler: DeactivateTenantHandler;
}

const tenantResponseJsonSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    name: { type: 'string' },
    slug: { type: 'string' },
    status: { type: 'string', enum: ['ACTIVE', 'INACTIVE'] },
    createdAt: { type: 'string' },
    updatedAt: { type: 'string' },
  },
  required: ['id', 'name', 'slug', 'status', 'createdAt', 'updatedAt'],
} as const;

const tenantJsonResponse = {
  'application/json': {
    schema: tenantResponseJsonSchema,
  },
} as const;

const errorJsonResponse = {
  'application/json': {
    schema: httpErrorResponseSchema,
  },
} as const;

function sendMappedError(reply: FastifyReply, error: unknown) {
  const mapped = mapApplicationErrorToHttp(error);

  return reply.status(mapped.statusCode).send({
    statusCode: mapped.statusCode,
    error: mapped.error,
    message: mapped.message,
  });
}

export async function registerTenantRoutes(
  app: FastifyInstance,
  handlers: TenantRouteHandlers,
): Promise<void> {
  app.post(
    '/tenants',
    {
      schema: {
        body: createTenantBodySchema,
        description:
          'Creates a tenant. Tenant creation will later be restricted to platform onboarding and admin flows.',
        response: {
          201: {
            description: 'Tenant created.',
            content: tenantJsonResponse,
          },
          400: {
            description: 'Validation error.',
            content: errorJsonResponse,
          },
          401: {
            description: 'Authentication required.',
            content: errorJsonResponse,
          },
          403: {
            description: 'Access denied.',
            content: errorJsonResponse,
          },
          409: {
            description: 'Tenant slug already exists.',
            content: errorJsonResponse,
          },
        },
      },
      config: {
        authorization: {
          resource: AuthorizationResource.TENANT,
          action: AuthorizationAction.CREATE,
        },
      },
    },
    async (request, reply) => {
      try {
        const body = request.body as CreateTenantBody;
        const response = await handlers.createTenantHandler.execute(
          toCreateTenantCommand(body),
        );

        return reply.status(201).send(response);
      } catch (error) {
        return sendMappedError(reply, error);
      }
    },
  );

  app.get(
    '/tenants/:id',
    {
      schema: {
        params: tenantIdParamsSchema,
        response: {
          200: {
            description: 'Tenant found.',
            content: tenantJsonResponse,
          },
          400: {
            description: 'Validation error.',
            content: errorJsonResponse,
          },
          401: {
            description: 'Authentication required.',
            content: errorJsonResponse,
          },
          403: {
            description: 'Access denied.',
            content: errorJsonResponse,
          },
          404: {
            description: 'Tenant not found.',
            content: errorJsonResponse,
          },
        },
      },
      config: {
        authorization: {
          resource: AuthorizationResource.TENANT,
          action: AuthorizationAction.READ,
          resourceIdParam: 'id',
        },
      },
    },
    async (request, reply) => {
      try {
        const { id } = request.params as { id: string };
        const result = await handlers.findTenantHandler.execute(
          new FindTenantQuery(id),
        );

        return reply.status(200).send(result);
      } catch (error) {
        return sendMappedError(reply, error);
      }
    },
  );

  app.post(
    '/tenants/:id/activate',
    {
      schema: {
        params: tenantIdParamsSchema,
        response: {
          200: {
            description: 'Tenant activated.',
            content: tenantJsonResponse,
          },
          400: {
            description: 'Validation error.',
            content: errorJsonResponse,
          },
          401: {
            description: 'Authentication required.',
            content: errorJsonResponse,
          },
          403: {
            description: 'Access denied.',
            content: errorJsonResponse,
          },
          404: {
            description: 'Tenant not found.',
            content: errorJsonResponse,
          },
        },
      },
      config: {
        authorization: {
          resource: AuthorizationResource.TENANT,
          action: AuthorizationAction.UPDATE,
          resourceIdParam: 'id',
        },
      },
    },
    async (request, reply) => {
      try {
        const { id } = request.params as { id: string };
        const result = await handlers.activateTenantHandler.execute(
          new ActivateTenantCommand(id),
        );

        return reply.status(200).send(result);
      } catch (error) {
        return sendMappedError(reply, error);
      }
    },
  );

  app.post(
    '/tenants/:id/deactivate',
    {
      schema: {
        params: tenantIdParamsSchema,
        response: {
          200: {
            description: 'Tenant deactivated.',
            content: tenantJsonResponse,
          },
          400: {
            description: 'Validation error.',
            content: errorJsonResponse,
          },
          401: {
            description: 'Authentication required.',
            content: errorJsonResponse,
          },
          403: {
            description: 'Access denied.',
            content: errorJsonResponse,
          },
          404: {
            description: 'Tenant not found.',
            content: errorJsonResponse,
          },
        },
      },
      config: {
        authorization: {
          resource: AuthorizationResource.TENANT,
          action: AuthorizationAction.UPDATE,
          resourceIdParam: 'id',
        },
      },
    },
    async (request, reply) => {
      try {
        const { id } = request.params as { id: string };
        const result = await handlers.deactivateTenantHandler.execute(
          new DeactivateTenantCommand(id),
        );

        return reply.status(200).send(result);
      } catch (error) {
        return sendMappedError(reply, error);
      }
    },
  );
}
