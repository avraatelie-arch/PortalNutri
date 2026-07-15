import type { FastifyInstance } from 'fastify';
import { buildApp } from '../app.js';
import { configureIntegrationTestEnv } from '../config/test-env.js';

export { requireDatabaseUrl } from '../config/test-env.js';
export { injectJson } from './auth-http-test.harness.js';

let fixtureCounter = 0;

export async function createTenantHttpTestApp(): Promise<FastifyInstance> {
  configureIntegrationTestEnv();
  return buildApp();
}

export function nextTenantFixtureSuffix(): string {
  fixtureCounter += 1;
  return `${fixtureCounter}`;
}

export function validCreateTenantPayload(suffix = nextTenantFixtureSuffix()) {
  return {
    name: `Portal Nutri Clinic ${suffix}`,
    slug: `portal-nutri-clinic-${suffix}`,
  };
}
