import type { FastifyInstance } from 'fastify';
import { buildApp } from '../app.js';
import { configureIntegrationTestEnv } from '../config/test-env.js';

export { requireDatabaseUrl } from '../config/test-env.js';
export { injectJson } from './auth-http-test.harness.js';

let fixtureCounter = 0;

export async function createRoleHttpTestApp(): Promise<FastifyInstance> {
  configureIntegrationTestEnv();
  return buildApp();
}

export function nextRoleFixtureSuffix(): string {
  fixtureCounter += 1;
  return `${fixtureCounter}`;
}

export function validCreateRolePayload(
  tenantId: string,
  suffix = nextRoleFixtureSuffix(),
) {
  return {
    tenantId,
    name: `Clinic Role ${suffix}`,
  };
}
