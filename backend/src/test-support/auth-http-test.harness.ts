import type { FastifyInstance, InjectOptions } from 'fastify';
import { buildApp } from '../app.js';
import { configureIntegrationTestEnv } from '../config/test-env.js';

export { requireDatabaseUrl } from '../config/test-env.js';

export async function createAuthHttpTestApp(): Promise<FastifyInstance> {
  configureIntegrationTestEnv();
  return buildApp();
}

export async function injectJson(
  app: FastifyInstance,
  options: InjectOptions,
): Promise<{ statusCode: number; body: unknown }> {
  const response = await app.inject(options);

  let body: unknown = response.body;

  if (response.headers['content-type']?.includes('application/json')) {
    body = response.json();
  }

  return {
    statusCode: response.statusCode,
    body,
  };
}
