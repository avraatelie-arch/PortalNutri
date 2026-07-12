import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../../app.js';
import {
  configureIntegrationTestEnv,
  requireDatabaseUrl,
} from '../../config/test-env.js';

requireDatabaseUrl();

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

describe('Request correlation (integration)', () => {
  let app: FastifyInstance;

  before(async () => {
    configureIntegrationTestEnv();
    app = await buildApp();
  });

  after(async () => {
    await app.close();
  });

  it('generates a UUID request ID when the header is absent', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/health',
    });

    assert.equal(response.statusCode, 200);

    const requestId = response.headers['x-request-id'];

    assert.equal(typeof requestId, 'string');
    assert.match(requestId ?? '', UUID_PATTERN);
  });

  it('propagates a non-empty incoming x-request-id', async () => {
    const incomingRequestId = 'client-correlation-123';

    const response = await app.inject({
      method: 'GET',
      url: '/health',
      headers: {
        'x-request-id': incomingRequestId,
      },
    });

    assert.equal(response.statusCode, 200);
    assert.equal(response.headers['x-request-id'], incomingRequestId);
  });

  it('generates a UUID when x-request-id is empty', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/health',
      headers: {
        'x-request-id': '',
      },
    });

    assert.equal(response.statusCode, 200);
    assert.match(response.headers['x-request-id'] ?? '', UUID_PATTERN);
  });

  it('returns x-request-id on every response', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/health',
    });

    assert.equal(response.statusCode, 200);
    assert.ok(response.headers['x-request-id']);
  });

  it('exposes x-request-id through CORS', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/health',
      headers: {
        origin: 'http://localhost:3000',
      },
    });

    assert.equal(response.statusCode, 200);

    const exposedHeaders = response.headers['access-control-expose-headers'];

    assert.equal(typeof exposedHeaders, 'string');
    assert.match(exposedHeaders ?? '', /x-request-id/i);
  });
});
