import assert from 'node:assert/strict';
import { after, before, beforeEach, describe, it } from 'node:test';
import type { FastifyInstance } from 'fastify';
import { DocumentType } from '../../domain/value-objects/document.js';
import {
  createPersonHttpTestApp,
  injectJson,
  requireDatabaseUrl,
  resetPersons,
  seedInactivePersonFixture,
  seedPersonFixture,
  validCreatePersonPayload,
} from '../../../../test-support/person-http-test.harness.js';
import {
  seedAuthenticatedFixture,
  withBearerToken,
} from '../../../../test-support/auth-http-test.harness.js';

requireDatabaseUrl();

const UNKNOWN_PERSON_ID = '550e8400-e29b-41d4-a716-446655440099';

describe('Person HTTP routes (integration)', () => {
  let app: FastifyInstance;
  let accessToken: string;

  before(async () => {
    app = await createPersonHttpTestApp();
  });

  beforeEach(async () => {
    await resetPersons();
    const auth = await seedAuthenticatedFixture(app);
    accessToken = auth.tokens.accessToken;
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
    it('creates a person', async () => {
      const payload = validCreatePersonPayload();

      const response = await authorizedInject({
        method: 'POST',
        url: '/api/iam/persons',
        payload,
      });

      assert.equal(response.statusCode, 201);

      const body = response.body as { id?: string; email?: string };

      assert.match(body.id ?? '', /^[0-9a-f-]{36}$/i);
      assert.equal(body.email, payload.email);
    });

    it('returns 409 for duplicate email', async () => {
      const payload = validCreatePersonPayload();

      const first = await authorizedInject({
        method: 'POST',
        url: '/api/iam/persons',
        payload,
      });

      assert.equal(first.statusCode, 201);

      const duplicate = await authorizedInject({
        method: 'POST',
        url: '/api/iam/persons',
        payload: {
          ...validCreatePersonPayload(),
          email: payload.email,
        },
      });

      assert.equal(duplicate.statusCode, 409);
    });

    it('returns 409 for duplicate document', async () => {
      const payload = validCreatePersonPayload();

      const first = await authorizedInject({
        method: 'POST',
        url: '/api/iam/persons',
        payload,
      });

      assert.equal(first.statusCode, 201);

      const duplicate = await authorizedInject({
        method: 'POST',
        url: '/api/iam/persons',
        payload: {
          ...validCreatePersonPayload(),
          document: payload.document,
        },
      });

      assert.equal(duplicate.statusCode, 409);
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
    it('returns an existing person', async () => {
      const seeded = await seedPersonFixture({
        fullName: 'João Santos',
        email: 'joao.santos@example.com',
        documentType: DocumentType.PASSPORT,
        documentValue: 'GET123456',
      });

      const response = await authorizedInject({
        method: 'GET',
        url: `/api/iam/persons/${seeded.personId}`,
      });

      assert.equal(response.statusCode, 200);

      const body = response.body as { id?: string; fullName?: string; email?: string };

      assert.equal(body.id, seeded.personId);
      assert.equal(body.fullName, 'João Santos');
      assert.equal(body.email, 'joao.santos@example.com');
    });

    it('returns 400 for invalid id', async () => {
      const response = await authorizedInject({
        method: 'GET',
        url: '/api/iam/persons/not-a-uuid',
      });

      assert.equal(response.statusCode, 400);
    });

    it('returns 404 when person is not found', async () => {
      const response = await authorizedInject({
        method: 'GET',
        url: `/api/iam/persons/${UNKNOWN_PERSON_ID}`,
      });

      assert.equal(response.statusCode, 404);
    });
  });

  describe('PUT /api/iam/persons/:id', () => {
    it('updates a person', async () => {
      const seeded = await seedPersonFixture({
        fullName: 'Ana Costa',
        email: 'ana.costa@example.com',
        documentType: DocumentType.RG,
        documentValue: 'PUT123456',
      });

      const response = await authorizedInject({
        method: 'PUT',
        url: `/api/iam/persons/${seeded.personId}`,
        payload: {
          fullName: 'Ana Costa Oliveira',
        },
      });

      assert.equal(response.statusCode, 200);

      const body = response.body as { fullName?: string; id?: string };

      assert.equal(body.id, seeded.personId);
      assert.equal(body.fullName, 'Ana Costa Oliveira');
    });

    it('returns 409 for duplicate email', async () => {
      const first = await seedPersonFixture({
        email: 'first.person@example.com',
        documentValue: 'PUT111111',
      });

      const second = await seedPersonFixture({
        email: 'second.person@example.com',
        documentValue: 'PUT222222',
      });

      const response = await authorizedInject({
        method: 'PUT',
        url: `/api/iam/persons/${second.personId}`,
        payload: {
          email: first.email,
        },
      });

      assert.equal(response.statusCode, 409);
    });

    it('returns 400 for empty body', async () => {
      const seeded = await seedPersonFixture({
        documentValue: 'PUT333333',
      });

      const response = await authorizedInject({
        method: 'PUT',
        url: `/api/iam/persons/${seeded.personId}`,
        payload: {},
      });

      assert.equal(response.statusCode, 400);
    });

    it('returns 404 when person is not found', async () => {
      const response = await authorizedInject({
        method: 'PUT',
        url: `/api/iam/persons/${UNKNOWN_PERSON_ID}`,
        payload: {
          fullName: 'Missing Person',
        },
      });

      assert.equal(response.statusCode, 404);
    });
  });

  describe('DELETE /api/iam/persons/:id', () => {
    it('deactivates a person', async () => {
      const seeded = await seedPersonFixture({
        documentValue: 'DEL111111',
      });

      const response = await authorizedInject({
        method: 'DELETE',
        url: `/api/iam/persons/${seeded.personId}`,
      });

      assert.equal(response.statusCode, 200);

      const body = response.body as { status?: string; id?: string };

      assert.equal(body.id, seeded.personId);
      assert.equal(body.status, 'INACTIVE');
    });

    it('is idempotent when person is already inactive', async () => {
      const seeded = await seedInactivePersonFixture({
        documentValue: 'DEL222222',
      });

      const response = await authorizedInject({
        method: 'DELETE',
        url: `/api/iam/persons/${seeded.personId}`,
      });

      assert.equal(response.statusCode, 200);

      const body = response.body as {
        status?: string;
        events?: unknown[];
      };

      assert.equal(body.status, 'INACTIVE');
      assert.equal(body.events, undefined);
    });

    it('returns 404 when person is not found', async () => {
      const response = await authorizedInject({
        method: 'DELETE',
        url: `/api/iam/persons/${UNKNOWN_PERSON_ID}`,
      });

      assert.equal(response.statusCode, 404);
    });
  });
});
