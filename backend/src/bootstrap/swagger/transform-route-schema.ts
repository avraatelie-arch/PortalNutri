import type { FastifySchema } from 'fastify';
import type { ZodTypeAny } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

function isZodSchema(schema: unknown): schema is ZodTypeAny {
  return (
    typeof schema === 'object' &&
    schema !== null &&
    'safeParse' in schema &&
    typeof schema.safeParse === 'function'
  );
}

function toJsonSchema(schema: unknown): unknown {
  if (!isZodSchema(schema)) {
    return schema;
  }

  return zodToJsonSchema(schema, {
    $refStrategy: 'none',
    target: 'openApi3',
  });
}

function isHealthRoute(url: string): boolean {
  return (
    url === '/health' ||
    url === '/health/live' ||
    url === '/health/ready' ||
    url === '/api/health'
  );
}

function isIamRoute(url: string): boolean {
  return (
    url.startsWith('/api/iam')
    || url.startsWith('/api/auth')
    || url.startsWith('/api/tenants')
    || url.startsWith('/api/memberships')
    || url.startsWith('/api/roles')
    || url.startsWith('/api/role-assignments')
    || url.startsWith('/api/permissions')
    || url.startsWith('/api/permission-assignments')
  );
}

function isPublicAuthRoute(url: string): boolean {
  return url === '/api/auth/login' || url === '/api/auth/refresh';
}

function requiresBearerAuth(url: string): boolean {
  return (
    isIamRoute(url)
    && !isPublicAuthRoute(url)
    && url !== '/api/auth/credentials'
  );
}

const errorResponseSchema = {
  type: 'object',
  properties: {
    statusCode: { type: 'number' },
    error: { type: 'string' },
    message: { type: 'string' },
  },
  required: ['statusCode', 'error', 'message'],
} as const;

const unauthorizedResponse = {
  description: 'Authentication required.',
  content: {
    'application/json': {
      schema: errorResponseSchema,
    },
  },
} as const;

const forbiddenResponse = {
  description: 'Access denied.',
  content: {
    'application/json': {
      schema: errorResponseSchema,
    },
  },
} as const;

function withProtectedResponses(schema: FastifySchema): FastifySchema {
  return {
    ...schema,
    response: {
      ...(typeof schema.response === 'object' && schema.response !== null
        ? schema.response
        : {}),
      401: unauthorizedResponse,
      403: forbiddenResponse,
    },
  };
}

export function transformRouteSchema({
  schema,
  url,
}: {
  schema: FastifySchema;
  url: string;
}) {
  if (isHealthRoute(url)) {
    return {
      schema: {
        hide: true,
      },
      url,
    };
  }

  const transformedSchema: FastifySchema = {
    ...schema,
  };

  if (schema.body !== undefined) {
    transformedSchema.body = toJsonSchema(schema.body);
  }

  if (schema.params !== undefined) {
    transformedSchema.params = toJsonSchema(schema.params);
  }

  if (schema.querystring !== undefined) {
    transformedSchema.querystring = toJsonSchema(schema.querystring);
  }

  if (schema.headers !== undefined) {
    transformedSchema.headers = toJsonSchema(schema.headers);
  }

  if (isIamRoute(url)) {
    transformedSchema.tags = ['IAM'];
  }

  if (requiresBearerAuth(url) && transformedSchema.security === undefined) {
    transformedSchema.security = [{ bearerAuth: [] }];
  }

  if (requiresBearerAuth(url)) {
    return {
      schema: withProtectedResponses(transformedSchema),
      url,
    };
  }

  return {
    schema: transformedSchema,
    url,
  };
}
