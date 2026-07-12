import assert from 'node:assert/strict';
import { after, before, beforeEach, describe, it } from 'node:test';
import type { FastifyInstance } from 'fastify';
import {
  createAuthHttpTestApp,
  injectJson,
  requireDatabaseUrl,
} from '../../../../test-support/auth-http-test.harness.js';
import {
  resetPersons,
  seedPersonFixture,
} from '../../../../test-support/person-http-test.harness.js';

requireDatabaseUrl();

const UNKNOWN_PERSON_ID = '550e8400-e29b-41d4-a716-446655440099';

describe('Auth HTTP routes (integration)', () => {
  let app: FastifyInstance;

  before(async () => {
    app = await createAuthHttpTestApp();
  });

  beforeEach(async () => {
    await resetPersons();
  });

  after(async () => {
    await app.close();
  });

  describe('POST /api/auth/credentials', () => {
    it('registers a credential for an existing person', async () => {
      const seeded = await seedPersonFixture();

      const response = await injectJson(app, {
        method: 'POST',
        url: '/api/auth/credentials',
        payload: {
          personId: seeded.personId,
          password: 'SecureP@ssw0rd',
        },
      });

      assert.equal(response.statusCode, 201);

      const body = response.body as {
        id?: string;
        personId?: string;
        status?: string;
      };

      assert.match(body.id ?? '', /^[0-9a-f-]{36}$/i);
      assert.equal(body.personId, seeded.personId);
      assert.equal(body.status, 'ACTIVE');
    });

    it('returns 409 when credential already exists', async () => {
      const seeded = await seedPersonFixture();

      const first = await injectJson(app, {
        method: 'POST',
        url: '/api/auth/credentials',
        payload: {
          personId: seeded.personId,
          password: 'SecureP@ssw0rd',
        },
      });

      assert.equal(first.statusCode, 201);

      const duplicate = await injectJson(app, {
        method: 'POST',
        url: '/api/auth/credentials',
        payload: {
          personId: seeded.personId,
          password: 'AnotherP@ss1',
        },
      });

      assert.equal(duplicate.statusCode, 409);
    });

    it('returns 404 when person does not exist', async () => {
      const response = await injectJson(app, {
        method: 'POST',
        url: '/api/auth/credentials',
        payload: {
          personId: UNKNOWN_PERSON_ID,
          password: 'SecureP@ssw0rd',
        },
      });

      assert.equal(response.statusCode, 404);
    });

    it('returns 400 for invalid payload', async () => {
      const response = await injectJson(app, {
        method: 'POST',
        url: '/api/auth/credentials',
        payload: {
          personId: 'not-a-uuid',
          password: 'short',
        },
      });

      assert.equal(response.statusCode, 400);
    });
  });
});
