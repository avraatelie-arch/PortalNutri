import type { FastifyInstance, FastifyReply } from 'fastify';
import type { CreatePermissionHandler } from '../../application/create-permission/create-permission.handler.js';
import type { FindPermissionAssignmentHandler } from '../../application/find-permission-assignment/find-permission-assignment.handler.js';
import { FindPermissionAssignmentQuery } from '../../application/find-permission-assignment/find-permission-assignment.query.js';
import type { FindPermissionHandler } from '../../application/find-permission/find-permission.handler.js';
import { FindPermissionQuery } from '../../application/find-permission/find-permission.query.js';
import type { GrantPermissionHandler } from '../../application/grant-permission/grant-permission.handler.js';
import type { RevokePermissionHandler } from '../../application/revoke-permission/revoke-permission.handler.js';
import { AuthorizationAction } from '../../application/authorization/authorization-action.js';
import { AuthorizationResource } from '../../application/authorization/authorization-resource.js';
import {
  mapPermissionAssignmentErrorToHttp,
  mapPermissionErrorToHttp,
} from './map-permission-error.js';
import {
  toCreatePermissionCommand,
  toGrantPermissionCommand,
  toPermissionAssignmentHttpResponse,
  toPermissionHttpResponse,
  toRevokePermissionCommand,
} from './permission-http.mapper.js';
import {
  createPermissionAssignmentBodySchema,
  createPermissionBodySchema,
  httpErrorResponseSchema,
  permissionAssignmentDeleteParamsSchema,
  permissionAssignmentIdParamsSchema,
  permissionAssignmentResponseJsonSchema,
  permissionIdParamsSchema,
  permissionResponseJsonSchema,
  type CreatePermissionAssignmentBody,
  type CreatePermissionBody,
} from './schemas/permission.schemas.js';

export interface PermissionRouteHandlers {
  createPermissionHandler: CreatePermissionHandler;
  findPermissionHandler: FindPermissionHandler;
  grantPermissionHandler: GrantPermissionHandler;
  findPermissionAssignmentHandler: FindPermissionAssignmentHandler;
  revokePermissionHandler: RevokePermissionHandler;
}

const permissionJsonResponse = {
  'application/json': {
    schema: permissionResponseJsonSchema,
  },
} as const;

const permissionAssignmentJsonResponse = {
  'application/json': {
    schema: permissionAssignmentResponseJsonSchema,
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

function sendPermissionError(reply: FastifyReply, error: unknown) {
  const mapped = mapPermissionErrorToHttp(error);
  return reply.status(mapped.statusCode).send(mapped);
}

function sendPermissionAssignmentError(reply: FastifyReply, error: unknown) {
  const mapped = mapPermissionAssignmentErrorToHttp(error);
  return reply.status(mapped.statusCode).send(mapped);
}

export async function registerPermissionRoutes(
  app: FastifyInstance,
  handlers: PermissionRouteHandlers,
): Promise<void> {
  app.post(
    '/permissions',
    {
      schema: {
        body: createPermissionBodySchema,
        response: {
          201: {
            description: 'Permission created.',
            content: permissionJsonResponse,
          },
          ...standardErrorResponses,
        },
      },
      config: {
        authorization: {
          resource: AuthorizationResource.PERMISSION,
          action: AuthorizationAction.CREATE,
          scopeTenantIdFromBody: 'tenantId',
        },
      },
    },
    async (request, reply) => {
      try {
        const body = request.body as CreatePermissionBody;
        const response = await handlers.createPermissionHandler.execute(
          toCreatePermissionCommand(body),
        );

        return reply.status(201).send(toPermissionHttpResponse(response));
      }
      catch (error) {
        return sendPermissionError(reply, error);
      }
    },
  );

  app.get(
    '/permissions/:id',
    {
      schema: {
        params: permissionIdParamsSchema,
        response: {
          200: {
            description: 'Permission found.',
            content: permissionJsonResponse,
          },
          400: standardErrorResponses[400],
          401: standardErrorResponses[401],
          403: standardErrorResponses[403],
        },
      },
      config: {
        authorization: {
          resource: AuthorizationResource.PERMISSION,
          action: AuthorizationAction.READ,
          resourceIdParam: 'id',
          resolveResourceTenantFromId: true,
        },
      },
    },
    async (request, reply) => {
      try {
        const { id } = request.params as { id: string };
        const result = await handlers.findPermissionHandler.execute(
          new FindPermissionQuery(id),
        );

        return reply.status(200).send(toPermissionHttpResponse(result));
      }
      catch (error) {
        return sendPermissionError(reply, error);
      }
    },
  );

  app.post(
    '/permission-assignments',
    {
      schema: {
        body: createPermissionAssignmentBodySchema,
        response: {
          201: {
            description: 'Permission assignment created.',
            content: permissionAssignmentJsonResponse,
          },
          200: {
            description: 'Permission assignment reactivated.',
            content: permissionAssignmentJsonResponse,
          },
          ...standardErrorResponses,
        },
      },
      config: {
        authorization: {
          resource: AuthorizationResource.PERMISSION_ASSIGNMENT,
          action: AuthorizationAction.CREATE,
          scopeRefsFromBody: ['roleId', 'permissionId'],
        },
      },
    },
    async (request, reply) => {
      try {
        const body = request.body as CreatePermissionAssignmentBody;
        const response = await handlers.grantPermissionHandler.execute(
          toGrantPermissionCommand(body),
        );
        const statusCode = response.operation === 'REACTIVATED' ? 200 : 201;

        return reply
          .status(statusCode)
          .send(toPermissionAssignmentHttpResponse(response));
      }
      catch (error) {
        return sendPermissionAssignmentError(reply, error);
      }
    },
  );

  app.get(
    '/permission-assignments/:id',
    {
      schema: {
        params: permissionAssignmentIdParamsSchema,
        response: {
          200: {
            description: 'Permission assignment found.',
            content: permissionAssignmentJsonResponse,
          },
          400: standardErrorResponses[400],
          401: standardErrorResponses[401],
          403: standardErrorResponses[403],
        },
      },
      config: {
        authorization: {
          resource: AuthorizationResource.PERMISSION_ASSIGNMENT,
          action: AuthorizationAction.READ,
          resourceIdParam: 'id',
          resolveResourceTenantFromId: true,
        },
      },
    },
    async (request, reply) => {
      try {
        const { id } = request.params as { id: string };
        const result = await handlers.findPermissionAssignmentHandler.execute(
          new FindPermissionAssignmentQuery(id),
        );

        return reply.status(200).send(toPermissionAssignmentHttpResponse(result));
      }
      catch (error) {
        return sendPermissionAssignmentError(reply, error);
      }
    },
  );

  app.delete(
    '/permission-assignments/:roleId/:permissionId',
    {
      schema: {
        params: permissionAssignmentDeleteParamsSchema,
        response: {
          200: {
            description: 'Permission assignment revoked.',
            content: permissionAssignmentJsonResponse,
          },
          ...standardErrorResponses,
        },
      },
      config: {
        authorization: {
          resource: AuthorizationResource.PERMISSION_ASSIGNMENT,
          action: AuthorizationAction.DELETE,
          scopeRefsFromParams: ['roleId', 'permissionId'],
        },
      },
    },
    async (request, reply) => {
      try {
        const { roleId, permissionId } = request.params as {
          roleId: string;
          permissionId: string;
        };
        const result = await handlers.revokePermissionHandler.execute(
          toRevokePermissionCommand({ roleId, permissionId }),
        );

        return reply.status(200).send(toPermissionAssignmentHttpResponse(result));
      }
      catch (error) {
        return sendPermissionAssignmentError(reply, error);
      }
    },
  );
}
