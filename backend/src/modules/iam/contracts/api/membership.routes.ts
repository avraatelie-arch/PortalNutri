import type { FastifyInstance, FastifyReply } from 'fastify';
import type { AddPersonToTenantHandler } from '../../application/add-person-to-tenant/add-person-to-tenant.handler.js';
import type { FindMembershipHandler } from '../../application/find-membership/find-membership.handler.js';
import { FindMembershipQuery } from '../../application/find-membership/find-membership.query.js';
import type { RemovePersonFromTenantHandler } from '../../application/remove-person-from-tenant/remove-person-from-tenant.handler.js';
import { AuthorizationAction } from '../../application/authorization/authorization-action.js';
import { AuthorizationResource } from '../../application/authorization/authorization-resource.js';
import { mapMembershipErrorToHttp } from './map-membership-error.js';
import {
  toAddPersonToTenantCommand,
  toMembershipHttpResponse,
  toRemovePersonFromTenantCommand,
} from './membership-http.mapper.js';
import {
  createMembershipBodySchema,
  httpErrorResponseSchema,
  membershipDeleteParamsSchema,
  membershipIdParamsSchema,
  membershipResponseJsonSchema,
  type CreateMembershipBody,
} from './schemas/membership.schemas.js';

export interface MembershipRouteHandlers {
  addPersonToTenantHandler: AddPersonToTenantHandler;
  findMembershipHandler: FindMembershipHandler;
  removePersonFromTenantHandler: RemovePersonFromTenantHandler;
}

const membershipJsonResponse = {
  'application/json': {
    schema: membershipResponseJsonSchema,
  },
} as const;

const errorJsonResponse = {
  'application/json': {
    schema: httpErrorResponseSchema,
  },
} as const;

function sendMappedError(reply: FastifyReply, error: unknown) {
  const mapped = mapMembershipErrorToHttp(error);

  return reply.status(mapped.statusCode).send({
    statusCode: mapped.statusCode,
    error: mapped.error,
    message: mapped.message,
  });
}

export async function registerMembershipRoutes(
  app: FastifyInstance,
  handlers: MembershipRouteHandlers,
): Promise<void> {
  app.post(
    '/memberships',
    {
      schema: {
        body: createMembershipBodySchema,
        response: {
          201: {
            description: 'Membership created.',
            content: membershipJsonResponse,
          },
          200: {
            description: 'Membership reactivated.',
            content: membershipJsonResponse,
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
            description: 'Person or tenant not found.',
            content: errorJsonResponse,
          },
          409: {
            description: 'Active membership already exists.',
            content: errorJsonResponse,
          },
        },
      },
      config: {
        authorization: {
          resource: AuthorizationResource.MEMBERSHIP,
          action: AuthorizationAction.CREATE,
          scopeTenantIdFromBody: 'tenantId',
        },
      },
    },
    async (request, reply) => {
      try {
        const body = request.body as CreateMembershipBody;
        const response = await handlers.addPersonToTenantHandler.execute(
          toAddPersonToTenantCommand(body),
        );
        const statusCode = response.operation === 'REACTIVATED' ? 200 : 201;

        return reply.status(statusCode).send(toMembershipHttpResponse(response));
      } catch (error) {
        return sendMappedError(reply, error);
      }
    },
  );

  app.get(
    '/memberships/:id',
    {
      schema: {
        params: membershipIdParamsSchema,
        response: {
          200: {
            description: 'Membership found.',
            content: membershipJsonResponse,
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
        },
      },
      config: {
        authorization: {
          resource: AuthorizationResource.MEMBERSHIP,
          action: AuthorizationAction.READ,
          resourceIdParam: 'id',
          resolveResourceTenantFromId: true,
        },
      },
    },
    async (request, reply) => {
      try {
        const { id } = request.params as { id: string };
        const result = await handlers.findMembershipHandler.execute(
          new FindMembershipQuery(id),
        );

        return reply.status(200).send(toMembershipHttpResponse(result));
      } catch (error) {
        return sendMappedError(reply, error);
      }
    },
  );

  app.delete(
    '/memberships/:personId/:tenantId',
    {
      schema: {
        params: membershipDeleteParamsSchema,
        response: {
          200: {
            description: 'Membership removed.',
            content: membershipJsonResponse,
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
            description: 'Membership not found.',
            content: errorJsonResponse,
          },
        },
      },
      config: {
        authorization: {
          resource: AuthorizationResource.MEMBERSHIP,
          action: AuthorizationAction.DELETE,
          scopeTenantIdFromParam: 'tenantId',
        },
      },
    },
    async (request, reply) => {
      try {
        const { personId, tenantId } = request.params as {
          personId: string;
          tenantId: string;
        };
        const result = await handlers.removePersonFromTenantHandler.execute(
          toRemovePersonFromTenantCommand({ personId, tenantId }),
        );

        return reply.status(200).send(toMembershipHttpResponse(result));
      } catch (error) {
        return sendMappedError(reply, error);
      }
    },
  );
}
