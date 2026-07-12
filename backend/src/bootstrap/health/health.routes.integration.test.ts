import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../../app.js';
import { APP_NAME, APP_VERSION } from '../../config/app-metadata.js';
import {
  configureIntegrationTestEnv,
  requireDatabaseUrl,
} from '../../config/test-env.js';

requireDatabaseUrl();

describe('Health routes (integration)', () => {
  let app: FastifyInstance;

  before(async () => {
    configureIntegrationTestEnv();
    app = await buildApp();
  });

  after(async () => {
    await app.close();
  });

  it('GET /health returns application metadata', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/health',
    });

    assert.equal(response.statusCode, 200);

    const body = response.json() as {
      status?: string;
      application?: string;
      version?: string;
      timestamp?: string;
      uptime?: number;
    };

    assert.equal(body.status, 'ok');
    assert.equal(body.application, APP_NAME);
    assert.equal(body.version, APP_VERSION);
    assert.equal(typeof body.timestamp, 'string');
    assert.ok(Number.isFinite(body.uptime));
  });

  it('GET /health/live returns alive status', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/health/live',
    });

    assert.equal(response.statusCode, 200);
    assert.deepEqual(response.json(), { status: 'alive' });
  });

  it('GET /health/ready returns ready checks when PostgreSQL is available', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/health/ready',
    });

    assert.equal(response.statusCode, 200);
    assert.deepEqual(response.json(), {
      status: 'ready',
      checks: {
        database: 'up',
        prisma: 'up',
      },
    });
  });

  it('GET /api/health keeps the deprecated compatibility alias', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/health',
    });

    assert.equal(response.statusCode, 200);

    const body = response.json() as {
      status?: string;
      application?: string;
      version?: string;
    };

    assert.equal(body.status, 'ok');
    assert.equal(body.application, APP_NAME);
    assert.equal(body.version, APP_VERSION);
  });
});
