import type { FastifyInstance, FastifyReply } from 'fastify';
import type { AssignRoleHandler } from '../../application/assign-role/assign-role.handler.js';
import type { CreateRoleHandler } from '../../application/create-role/create-role.handler.js';
import type { FindRoleAssignmentHandler } from '../../application/find-role-assignment/find-role-assignment.handler.js';
import { FindRoleAssignmentQuery } from '../../application/find-role-assignment/find-role-assignment.query.js';
import type { FindRoleHandler } from '../../application/find-role/find-role.handler.js';
import { FindRoleQuery } from '../../application/find-role/find-role.query.js';
import type { RemoveRoleHandler } from '../../application/remove-role/remove-role.handler.js';
import { AuthorizationAction } from '../../application/authorization/authorization-action.js';
import { AuthorizationResource } from '../../application/authorization/authorization-resource.js';
import {
  mapRoleAssignmentErrorToHttp,
  mapRoleErrorToHttp,
} from './map-role-error.js';
import {
  toAssignRoleCommand,
  toCreateRoleCommand,
  toRemoveRoleCommand,
  toRoleAssignmentHttpResponse,
  toRoleHttpResponse,
} from './role-http.mapper.js';
import {
  createRoleAssignmentBodySchema,
  createRoleBodySchema,
  httpErrorResponseSchema,
  roleAssignmentDeleteParamsSchema,
  roleAssignmentIdParamsSchema,
  roleAssignmentResponseJsonSchema,
  roleIdParamsSchema,
  roleResponseJsonSchema,
  type CreateRoleAssignmentBody,
  type CreateRoleBody,
} from './schemas/role.schemas.js';

export interface RoleRouteHandlers {
  createRoleHandler: CreateRoleHandler;
  findRoleHandler: FindRoleHandler;
  assignRoleHandler: AssignRoleHandler;
  findRoleAssignmentHandler: FindRoleAssignmentHandler;
  removeRoleHandler: RemoveRoleHandler;
}

const roleJsonResponse = {
  'application/json': {
    schema: roleResponseJsonSchema,
  },
} as const;

const roleAssignmentJsonResponse = {
  'application/json': {
    schema: roleAssignmentResponseJsonSchema,
  },
} as const;

const errorJsonResponse = {
  'application/json': {
    schema: httpErrorResponseSchema,
  },
} as const;

const standardErrorResponses = {
  400: { description: 'Validation error.', content: errorJsonResponse },
  401: { description: 'Authentication required.', content: errorJsonResponse },
  403: { description: 'Access denied.', content: errorJsonResponse },
  404: { description: 'Resource not found.', content: errorJsonResponse },
  409: { description: 'Conflict.', content: errorJsonResponse },
} as const;

function sendRoleError(reply: FastifyReply, error: unknown) {
  const mapped = mapRoleErrorToHttp(error);
  return reply.status(mapped.statusCode).send(mapped);
}

function sendRoleAssignmentError(reply: FastifyReply, error: unknown) {
  const mapped = mapRoleAssignmentErrorToHttp(error);
  return reply.status(mapped.statusCode).send(mapped);
}

export async function registerRoleRoutes(
  app: FastifyInstance,
  handlers: RoleRouteHandlers,
): Promise<void> {
  app.post(
    '/roles',
    {
      schema: {
        body: createRoleBodySchema,
        response: {
          201: { description: 'Role created.', content: roleJsonResponse },
          ...standardErrorResponses,
        },
      },
      config: {
        authorization: {
          resource: AuthorizationResource.ROLE,
          action: AuthorizationAction.CREATE,
          scopeTenantIdFromBody: 'tenantId',
        },
      },
    },
    async (request, reply) => {
      try {
        const body = request.body as CreateRoleBody;
        const response = await handlers.createRoleHandler.execute(
          toCreateRoleCommand(body),
        );

        return reply.status(201).send(toRoleHttpResponse(response));
      }
      catch (error) {
        return sendRoleError(reply, error);
      }
    },
  );

  app.get(
    '/roles/:id',
    {
      schema: {
        params: roleIdParamsSchema,
        response: {
          200: { description: 'Role found.', content: roleJsonResponse },
          400: standardErrorResponses[400],
          401: standardErrorResponses[401],
          403: standardErrorResponses[403],
        },
      },
      config: {
        authorization: {
          resource: AuthorizationResource.ROLE,
          action: AuthorizationAction.READ,
          resourceIdParam: 'id',
          resolveResourceTenantFromId: true,
        },
      },
    },
    async (request, reply) => {
      try {
        const { id } = request.params as { id: string };
        const result = await handlers.findRoleHandler.execute(
          new FindRoleQuery(id),
        );

        return reply.status(200).send(toRoleHttpResponse(result));
      }
      catch (error) {
        return sendRoleError(reply, error);
      }
    },
  );

  app.post(
    '/role-assignments',
    {
      schema: {
        body: createRoleAssignmentBodySchema,
        response: {
          201: {
            description: 'Role assignment created.',
            content: roleAssignmentJsonResponse,
          },
          200: {
            description: 'Role assignment reactivated.',
            content: roleAssignmentJsonResponse,
          },
          ...standardErrorResponses,
        },
      },
      config: {
        authorization: {
          resource: AuthorizationResource.ROLE_ASSIGNMENT,
          action: AuthorizationAction.CREATE,
          scopeRefsFromBody: ['membershipId', 'roleId'],
        },
      },
    },
    async (request, reply) => {
      try {
        const body = request.body as CreateRoleAssignmentBody;
        const response = await handlers.assignRoleHandler.execute(
          toAssignRoleCommand(body),
        );
        const statusCode = response.operation === 'REACTIVATED' ? 200 : 201;

        return reply
          .status(statusCode)
          .send(toRoleAssignmentHttpResponse(response));
      }
      catch (error) {
        return sendRoleAssignmentError(reply, error);
      }
    },
  );

  app.get(
    '/role-assignments/:id',
    {
      schema: {
        params: roleAssignmentIdParamsSchema,
        response: {
          200: {
            description: 'Role assignment found.',
            content: roleAssignmentJsonResponse,
          },
          400: standardErrorResponses[400],
          401: standardErrorResponses[401],
          403: standardErrorResponses[403],
        },
      },
      config: {
        authorization: {
          resource: AuthorizationResource.ROLE_ASSIGNMENT,
          action: AuthorizationAction.READ,
          resourceIdParam: 'id',
          resolveResourceTenantFromId: true,
        },
      },
    },
    async (request, reply) => {
      try {
        const { id } = request.params as { id: string };
        const result = await handlers.findRoleAssignmentHandler.execute(
          new FindRoleAssignmentQuery(id),
        );

        return reply.status(200).send(toRoleAssignmentHttpResponse(result));
      }
      catch (error) {
        return sendRoleAssignmentError(reply, error);
      }
    },
  );

  app.delete(
    '/role-assignments/:membershipId/:roleId',
    {
      schema: {
        params: roleAssignmentDeleteParamsSchema,
        response: {
          200: {
            description: 'Role assignment removed.',
            content: roleAssignmentJsonResponse,
          },
          ...standardErrorResponses,
        },
      },
      config: {
        authorization: {
          resource: AuthorizationResource.ROLE_ASSIGNMENT,
          action: AuthorizationAction.DELETE,
          scopeRefsFromParams: ['membershipId', 'roleId'],
        },
      },
    },
    async (request, reply) => {
      try {
        const { membershipId, roleId } = request.params as {
          membershipId: string;
          roleId: string;
        };
        const result = await handlers.removeRoleHandler.execute(
          toRemoveRoleCommand({ membershipId, roleId }),
        );

        return reply.status(200).send(toRoleAssignmentHttpResponse(result));
      }
      catch (error) {
        return sendRoleAssignmentError(reply, error);
      }
    },
  );
}
