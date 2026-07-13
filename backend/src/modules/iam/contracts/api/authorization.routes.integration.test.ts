import assert from 'node:assert/strict';
import { after, before, beforeEach, describe, it } from 'node:test';
import type { FastifyInstance } from 'fastify';
import { UNAUTHORIZED_MESSAGE } from '../../application/authentication/unauthorized-response.js';
import { FORBIDDEN_MESSAGE } from '../../application/authorization/forbidden-response.js';
import {
  createAuthHttpTestApp,
  createAuthHttpTestAppWithEnv,
  injectJson,
  requireDatabaseUrl,
  seedAuthenticatedFixture,
  withBearerToken,
} from '../../../../test-support/auth-http-test.harness.js';
import {
  resetPersons,
  seedPersonFixture,
  validCreatePersonPayload,
} from '../../../../test-support/person-http-test.harness.js';

requireDatabaseUrl();

const UNKNOWN_PERSON_ID = '550e8400-e29b-41d4-a716-446655440099';

function assertUnauthorized(body: unknown) {
  assert.deepEqual(body, {
    statusCode: 401,
    error: 'Unauthorized',
    message: UNAUTHORIZED_MESSAGE,
  });
}

function assertForbidden(body: unknown) {
  assert.deepEqual(body, {
    statusCode: 403,
    error: 'Forbidden',
    message: FORBIDDEN_MESSAGE,
  });
}

describe('Authorization HTTP (integration)', () => {
  let app: FastifyInstance;
  let accessToken: string;
  let authenticatedPersonId: string;

  before(async () => {
    app = await createAuthHttpTestApp();
  });

  beforeEach(async () => {
    await resetPersons();
    const auth = await seedAuthenticatedFixture(app);
    accessToken = auth.tokens.accessToken;
    authenticatedPersonId = auth.personId;
  });

  after(async () => {
    await app.close();
  });

  function authorizedInject(
    options: Parameters<typeof injectJson>[1],
  ) {
    return injectJson(app, withBearerToken(accessToken, options));
  }

  describe('self Person access', () => {
    it('allows GET on own Person', async () => {
      const response = await authorizedInject({
        method: 'GET',
        url: `/api/iam/persons/${authenticatedPersonId}`,
      });

      assert.equal(response.statusCode, 200);

      const body = response.body as { id?: string };

      assert.equal(body.id, authenticatedPersonId);
    });

    it('allows PUT on own Person', async () => {
      const response = await authorizedInject({
        method: 'PUT',
        url: `/api/iam/persons/${authenticatedPersonId}`,
        payload: {
          fullName: 'Updated Self Name',
        },
      });

      assert.equal(response.statusCode, 200);

      const body = response.body as { fullName?: string };

      assert.equal(body.fullName, 'Updated Self Name');
    });

    it('allows DELETE on own Person', async () => {
      const response = await authorizedInject({
        method: 'DELETE',
        url: `/api/iam/persons/${authenticatedPersonId}`,
      });

      assert.equal(response.statusCode, 200);

      const body = response.body as { status?: string };

      assert.equal(body.status, 'INACTIVE');
    });
  });

  describe('cross-principal Person access', () => {
    it('returns 403 for GET on another Person', async () => {
      const other = await seedPersonFixture({
        documentValue: 'AUTHZ001',
      });

      const response = await authorizedInject({
        method: 'GET',
        url: `/api/iam/persons/${other.personId}`,
      });

      assert.equal(response.statusCode, 403);
      assertForbidden(response.body);
    });

    it('returns 403 for PUT on another Person', async () => {
      const other = await seedPersonFixture({
        documentValue: 'AUTHZ002',
      });

      const response = await authorizedInject({
        method: 'PUT',
        url: `/api/iam/persons/${other.personId}`,
        payload: {
          fullName: 'Forbidden Update',
        },
      });

      assert.equal(response.statusCode, 403);
      assertForbidden(response.body);
    });

    it('returns 403 for DELETE on another Person', async () => {
      const other = await seedPersonFixture({
        documentValue: 'AUTHZ003',
      });

      const response = await authorizedInject({
        method: 'DELETE',
        url: `/api/iam/persons/${other.personId}`,
      });

      assert.equal(response.statusCode, 403);
      assertForbidden(response.body);
    });

    it('returns 403 for GET on a nonexistent Person id', async () => {
      const response = await authorizedInject({
        method: 'GET',
        url: `/api/iam/persons/${UNKNOWN_PERSON_ID}`,
      });

      assert.equal(response.statusCode, 403);
      assertForbidden(response.body);
    });
  });

  describe('Person creation', () => {
    it('returns 403 for POST Person by authenticated user', async () => {
      const response = await authorizedInject({
        method: 'POST',
        url: '/api/iam/persons',
        payload: validCreatePersonPayload(),
      });

      assert.equal(response.statusCode, 403);
      assertForbidden(response.body);
    });
  });

  describe('authentication boundary', () => {
    it('returns 401 for protected route without token', async () => {
      const response = await injectJson(app, {
        method: 'GET',
        url: `/api/iam/persons/${authenticatedPersonId}`,
      });

      assert.equal(response.statusCode, 401);
      assertUnauthorized(response.body);
    });
  });

  describe('fail-closed metadata', () => {
    it('returns 403 for protected route without authorization metadata', async () => {
      const isolatedApp = await createAuthHttpTestApp();

      isolatedApp.get(
        '/api/iam/protected-without-metadata',
        async (_request, reply) => reply.status(200).send({ ok: true }),
      );

      try {
        await resetPersons();
        const auth = await seedAuthenticatedFixture(isolatedApp);

        const response = await injectJson(
          isolatedApp,
          withBearerToken(auth.tokens.accessToken, {
            method: 'GET',
            url: '/api/iam/protected-without-metadata',
          }),
        );

        assert.equal(response.statusCode, 403);
        assertForbidden(response.body);
      }
      finally {
        await isolatedApp.close();
      }
    });
  });

  describe('authenticated-only routes', () => {
    it('allows GET /api/auth/me with valid token', async () => {
      const response = await authorizedInject({
        method: 'GET',
        url: '/api/auth/me',
      });

      assert.equal(response.statusCode, 200);

      const body = response.body as { personId?: string };

      assert.equal(body.personId, authenticatedPersonId);
    });

    it('allows POST /api/auth/logout with valid token', async () => {
      const response = await authorizedInject({
        method: 'POST',
        url: '/api/auth/logout',
      });

      assert.equal(response.statusCode, 204);
    });
  });

  describe('public routes', () => {
    it('allows health without token', async () => {
      const response = await injectJson(app, {
        method: 'GET',
        url: '/health',
      });

      assert.equal(response.statusCode, 200);
    });

    it('allows docs without token', async () => {
      const docsApp = await createAuthHttpTestAppWithEnv({
        OPENAPI_ENABLED: 'true',
      });

      try {
        const response = await injectJson(docsApp, {
          method: 'GET',
          url: '/docs',
        });

        assert.equal(response.statusCode, 200);
      }
      finally {
        await docsApp.close();
      }
    });
  });

  describe('OpenAPI security responses', () => {
    it('documents 401 and 403 for protected IAM endpoints', async () => {
      const docsApp = await createAuthHttpTestAppWithEnv({
        OPENAPI_ENABLED: 'true',
      });

      try {
        const response = await injectJson(docsApp, {
          method: 'GET',
          url: '/docs/json',
        });

        assert.equal(response.statusCode, 200);

        const spec = response.body as {
          paths?: Record<string, Record<string, { responses?: Record<string, unknown> }>>;
        };

        const personGet = spec.paths?.['/api/iam/persons/{id}']?.get;
        const responses = personGet?.responses ?? {};

        assert.ok('401' in responses);
        assert.ok('403' in responses);
      }
      finally {
        await docsApp.close();
      }
    });
  });
});
