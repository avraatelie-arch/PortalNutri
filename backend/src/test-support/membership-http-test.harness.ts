import type { FastifyInstance } from 'fastify';
import { buildApp } from '../app.js';
import { configureIntegrationTestEnv } from '../config/test-env.js';

export { requireDatabaseUrl } from '../config/test-env.js';
export { injectJson } from './auth-http-test.harness.js';

export async function createMembershipHttpTestApp(): Promise<FastifyInstance> {
  configureIntegrationTestEnv();
  return buildApp();
}
