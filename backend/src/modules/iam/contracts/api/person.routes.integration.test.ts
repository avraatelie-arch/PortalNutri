import assert from 'node:assert/strict';
import { after, before, beforeEach, describe, it } from 'node:test';
import type { FastifyInstance } from 'fastify';
import { DocumentType } from '../../domain/value-objects/document.js';
import { FORBIDDEN_MESSAGE } from '../../application/authorization/forbidden-response.js';
import {
  createPersonHttpTestApp,
  injectJson,
  requireDatabaseUrl,
  resetPersons,
  seedPersonFixture,
  validCreatePersonPayload,
} from '../../../../test-support/person-http-test.harness.js';
import {
  seedAuthenticatedFixture,
  withBearerToken,
} from '../../../../test-support/auth-http-test.harness.js';

requireDatabaseUrl();

const UNKNOWN_PERSON_ID = '550e8400-e29b-41d4-a716-446655440099';

function assertForbidden(body: unknown) {
  assert.deepEqual(body, {
    statusCode: 403,
    error: 'Forbidden',
    message: FORBIDDEN_MESSAGE,
  });
}

describe('Person HTTP routes (integration)', () => {
  let app: FastifyInstance;
  let accessToken: string;
  let authenticatedPersonId: string;

  before(async () => {
    app = await createPersonHttpTestApp();
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

  describe('POST /api/iam/persons', () => {
    it('returns 403 for authenticated users', async () => {
      const response = await authorizedInject({
        method: 'POST',
        url: '/api/iam/persons',
        payload: validCreatePersonPayload(),
      });

      assert.equal(response.statusCode, 403);
      assertForbidden(response.body);
    });

    it('returns 400 for invalid payload', async () => {
      const response = await authorizedInject({
        method: 'POST',
        url: '/api/iam/persons',
        payload: {
          email: 'invalid-email',
        },
      });

      assert.equal(response.statusCode, 400);
    });

    it('returns 401 without bearer token', async () => {
      const response = await injectJson(app, {
        method: 'POST',
        url: '/api/iam/persons',
        payload: validCreatePersonPayload(),
      });

      assert.equal(response.statusCode, 401);
    });
  });

  describe('GET /api/iam/persons/:id', () => {
    it('returns the authenticated person', async () => {
      const response = await authorizedInject({
        method: 'GET',
        url: `/api/iam/persons/${authenticatedPersonId}`,
      });

      assert.equal(response.statusCode, 200);

      const body = response.body as { id?: string; email?: string };

      assert.equal(body.id, authenticatedPersonId);
      assert.match(body.email ?? '', /@/);
    });

    it('returns 400 for invalid id', async () => {
      const response = await authorizedInject({
        method: 'GET',
        url: '/api/iam/persons/not-a-uuid',
      });

      assert.equal(response.statusCode, 400);
    });

    it('returns 403 when accessing another person', async () => {
      const other = await seedPersonFixture({
        fullName: 'João Santos',
        email: 'joao.santos@example.com',
        documentType: DocumentType.PASSPORT,
        documentValue: 'GET123456',
      });

      const response = await authorizedInject({
        method: 'GET',
        url: `/api/iam/persons/${other.personId}`,
      });

      assert.equal(response.statusCode, 403);
      assertForbidden(response.body);
    });

    it('returns 403 when person id does not exist', async () => {
      const response = await authorizedInject({
        method: 'GET',
        url: `/api/iam/persons/${UNKNOWN_PERSON_ID}`,
      });

      assert.equal(response.statusCode, 403);
      assertForbidden(response.body);
    });
  });

  describe('PUT /api/iam/persons/:id', () => {
    it('updates the authenticated person', async () => {
      const response = await authorizedInject({
        method: 'PUT',
        url: `/api/iam/persons/${authenticatedPersonId}`,
        payload: {
          fullName: 'Ana Costa Oliveira',
        },
      });

      assert.equal(response.statusCode, 200);

      const body = response.body as { fullName?: string; id?: string };

      assert.equal(body.id, authenticatedPersonId);
      assert.equal(body.fullName, 'Ana Costa Oliveira');
    });

    it('returns 403 when updating another person', async () => {
      const other = await seedPersonFixture({
        email: 'first.person@example.com',
        documentValue: 'PUT111111',
      });

      const response = await authorizedInject({
        method: 'PUT',
        url: `/api/iam/persons/${other.personId}`,
        payload: {
          email: other.email,
        },
      });

      assert.equal(response.statusCode, 403);
      assertForbidden(response.body);
    });

    it('returns 400 for empty body', async () => {
      const response = await authorizedInject({
        method: 'PUT',
        url: `/api/iam/persons/${authenticatedPersonId}`,
        payload: {},
      });

      assert.equal(response.statusCode, 400);
    });

    it('returns 403 when person id does not exist', async () => {
      const response = await authorizedInject({
        method: 'PUT',
        url: `/api/iam/persons/${UNKNOWN_PERSON_ID}`,
        payload: {
          fullName: 'Missing Person',
        },
      });

      assert.equal(response.statusCode, 403);
      assertForbidden(response.body);
    });
  });

  describe('DELETE /api/iam/persons/:id', () => {
    it('deactivates the authenticated person', async () => {
      const response = await authorizedInject({
        method: 'DELETE',
        url: `/api/iam/persons/${authenticatedPersonId}`,
      });

      assert.equal(response.statusCode, 200);

      const body = response.body as { status?: string; id?: string };

      assert.equal(body.id, authenticatedPersonId);
      assert.equal(body.status, 'INACTIVE');
    });

    it('returns 403 when deleting another person', async () => {
      const other = await seedPersonFixture({
        documentValue: 'DEL111111',
      });

      const response = await authorizedInject({
        method: 'DELETE',
        url: `/api/iam/persons/${other.personId}`,
      });

      assert.equal(response.statusCode, 403);
      assertForbidden(response.body);
    });

    it('is idempotent when authenticated person is already inactive', async () => {
      await authorizedInject({
        method: 'DELETE',
        url: `/api/iam/persons/${authenticatedPersonId}`,
      });

      const response = await authorizedInject({
        method: 'DELETE',
        url: `/api/iam/persons/${authenticatedPersonId}`,
      });

      assert.equal(response.statusCode, 200);

      const body = response.body as {
        status?: string;
        events?: unknown[];
      };

      assert.equal(body.status, 'INACTIVE');
      assert.equal(body.events, undefined);
    });

    it('returns 403 when person id does not exist', async () => {
      const response = await authorizedInject({
        method: 'DELETE',
        url: `/api/iam/persons/${UNKNOWN_PERSON_ID}`,
      });

      assert.equal(response.statusCode, 403);
      assertForbidden(response.body);
    });
  });
});
