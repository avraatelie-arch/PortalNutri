import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import type { FastifyInstance } from 'fastify';
import { buildOpenApiConfig } from '../../config/openapi.js';
import type { Env } from '../../config/env.js';
import { transformRouteSchema } from './transform-route-schema.js';

export async function registerSwagger(
  app: FastifyInstance,
  env: Env,
): Promise<void> {
  if (!env.OPENAPI_ENABLED) {
    return;
  }

  await app.register(swagger, {
    openapi: buildOpenApiConfig(env),
    transform: transformRouteSchema,
  });

  await app.register(swaggerUi, {
    routePrefix: '/docs',
  });
}
