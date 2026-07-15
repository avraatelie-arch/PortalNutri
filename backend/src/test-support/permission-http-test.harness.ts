import type { FastifyInstance } from 'fastify';
import { buildApp } from '../app.js';
import { configureIntegrationTestEnv } from '../config/test-env.js';

export { requireDatabaseUrl } from '../config/test-env.js';
export { injectJson } from './auth-http-test.harness.js';

let fixtureCounter = 0;

export async function createPermissionHttpTestApp(): Promise<FastifyInstance> {
  configureIntegrationTestEnv();
  return buildApp();
}

export function nextPermissionFixtureSuffix(): string {
  fixtureCounter += 1;
  return `${fixtureCounter}`;
}

export function validCreatePermissionPayload(
  tenantId: string,
  suffix = nextPermissionFixtureSuffix(),
) {
  return {
    tenantId,
    name: `Clinic Permission ${suffix}`,
  };
}
