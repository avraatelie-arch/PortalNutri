import assert from 'node:assert/strict';
import { after, before, beforeEach, describe, it } from 'node:test';
import type { FastifyInstance } from 'fastify';
import { FORBIDDEN_MESSAGE } from '../../application/authorization/forbidden-response.js';
import {
  createAuthHttpTestAppWithEnv,
  grantTenantPermissions,
  seedAuthenticatedFixture,
  withBearerToken,
} from '../../../../test-support/auth-http-test.harness.js';
import { resetRbacFixtures } from '../../../../test-support/rbac-test.harness.js';
import {
  createTenantHttpTestApp,
  injectJson,
  requireDatabaseUrl,
  validCreateTenantPayload,
} from '../../../../test-support/tenant-http-test.harness.js';

requireDatabaseUrl();

const UNKNOWN_TENANT_ID = '550e8400-e29b-41d4-a716-446655440099';

function assertForbidden(body: unknown) {
  assert.deepEqual(body, {
    statusCode: 403,
    error: 'Forbidden',
    message: FORBIDDEN_MESSAGE,
  });
}

describe('Tenant HTTP routes (integration)', () => {
  let app: FastifyInstance;
  let accessToken: string;
  let authenticatedPersonId: string;
  let sessionId: string;

  before(async () => {
    app = await createTenantHttpTestApp();
  });

  beforeEach(async () => {
    await resetRbacFixtures();
    const auth = await seedAuthenticatedFixture(app);
    accessToken = auth.tokens.accessToken;
    authenticatedPersonId = auth.personId;
    sessionId = auth.tokens.sessionId;
  });

  after(async () => {
    await app.close();
  });

  function authorizedInject(
    options: Parameters<typeof injectJson>[1],
  ) {
    return injectJson(app, withBearerToken(accessToken, options));
  }

  async function authorizeTenant(
    permissions: Array<'TENANT_READ' | 'TENANT_CREATE' | 'TENANT_UPDATE'>,
  ): Promise<string> {
    return grantTenantPermissions(
      authenticatedPersonId,
      sessionId,
      permissions,
    );
  }

  async function createOtherTenantViaApi(): Promise<string> {
    const response = await authorizedInject({
      method: 'POST',
      url: '/api/tenants',
      payload: validCreateTenantPayload('other'),
    });

    assert.equal(response.statusCode, 201);

    return (response.body as { id: string }).id;
  }

  describe('POST /api/tenants', () => {
    it('creates a tenant', async () => {
      await authorizeTenant(['TENANT_CREATE']);

      const payload = validCreateTenantPayload();
      const response = await authorizedInject({
        method: 'POST',
        url: '/api/tenants',
        payload,
      });

      assert.equal(response.statusCode, 201);

      const body = response.body as {
        id?: string;
        name?: string;
        slug?: string;
        status?: string;
      };

      assert.match(body.id ?? '', /^[0-9a-f-]{36}$/i);
      assert.equal(body.name, payload.name);
      assert.equal(body.slug, payload.slug);
      assert.equal(body.status, 'ACTIVE');
    });

    it('returns 409 for duplicate slug', async () => {
      await authorizeTenant(['TENANT_CREATE']);

      const payload = validCreateTenantPayload('duplicate');

      const first = await authorizedInject({
        method: 'POST',
        url: '/api/tenants',
        payload,
      });

      assert.equal(first.statusCode, 201);

      const duplicate = await authorizedInject({
        method: 'POST',
        url: '/api/tenants',
        payload: {
          name: 'Another Clinic Name',
          slug: payload.slug,
        },
      });

      assert.equal(duplicate.statusCode, 409);
    });

    it('returns 400 for validation error', async () => {
      await authorizeTenant(['TENANT_CREATE']);

      const response = await authorizedInject({
        method: 'POST',
        url: '/api/tenants',
        payload: {
          name: 'A',
          slug: 'INVALID SLUG',
        },
      });

      assert.equal(response.statusCode, 400);
    });

    it('returns 401 without bearer token', async () => {
      const response = await injectJson(app, {
        method: 'POST',
        url: '/api/tenants',
        payload: validCreateTenantPayload(),
      });

      assert.equal(response.statusCode, 401);
    });

    it('returns 403 without TENANT_CREATE', async () => {
      await authorizeTenant(['TENANT_READ']);

      const response = await authorizedInject({
        method: 'POST',
        url: '/api/tenants',
        payload: validCreateTenantPayload(),
      });

      assert.equal(response.statusCode, 403);
      assertForbidden(response.body);
    });
  });

  describe('Tenant resource scope', () => {
    it('allows GET when TENANT_READ matches the bound tenant', async () => {
      const boundTenantId = await authorizeTenant(['TENANT_READ']);

      const response = await authorizedInject({
        method: 'GET',
        url: `/api/tenants/${boundTenantId}`,
      });

      assert.equal(response.statusCode, 200);

      const body = response.body as { id?: string; status?: string };

      assert.equal(body.id, boundTenantId);
      assert.equal(body.status, 'ACTIVE');
    });

    it('returns 403 for GET on another existing tenant id', async () => {
      const boundTenantId = await authorizeTenant(['TENANT_READ', 'TENANT_CREATE']);
      const otherTenantId = await createOtherTenantViaApi();

      assert.notEqual(otherTenantId, boundTenantId);

      const response = await authorizedInject({
        method: 'GET',
        url: `/api/tenants/${otherTenantId}`,
      });

      assert.equal(response.statusCode, 403);
      assertForbidden(response.body);
    });

    it('returns 403 for GET on a nonexistent other tenant id without revealing existence', async () => {
      const boundTenantId = await authorizeTenant(['TENANT_READ']);

      assert.notEqual(UNKNOWN_TENANT_ID, boundTenantId);

      const response = await authorizedInject({
        method: 'GET',
        url: `/api/tenants/${UNKNOWN_TENANT_ID}`,
      });

      assert.equal(response.statusCode, 403);
      assertForbidden(response.body);
    });

    it('allows activate on the bound tenant', async () => {
      const boundTenantId = await authorizeTenant(['TENANT_UPDATE']);

      await authorizedInject({
        method: 'POST',
        url: `/api/tenants/${boundTenantId}/deactivate`,
      });

      const response = await authorizedInject({
        method: 'POST',
        url: `/api/tenants/${boundTenantId}/activate`,
      });

      assert.equal(response.statusCode, 200);

      const body = response.body as { id?: string; status?: string };

      assert.equal(body.id, boundTenantId);
      assert.equal(body.status, 'ACTIVE');
    });

    it('returns 403 for activate on another tenant id', async () => {
      const boundTenantId = await authorizeTenant(['TENANT_UPDATE', 'TENANT_CREATE']);
      const otherTenantId = await createOtherTenantViaApi();

      assert.notEqual(otherTenantId, boundTenantId);

      const response = await authorizedInject({
        method: 'POST',
        url: `/api/tenants/${otherTenantId}/activate`,
      });

      assert.equal(response.statusCode, 403);
      assertForbidden(response.body);
    });

    it('allows deactivate on the bound tenant', async () => {
      const boundTenantId = await authorizeTenant(['TENANT_UPDATE']);

      const response = await authorizedInject({
        method: 'POST',
        url: `/api/tenants/${boundTenantId}/deactivate`,
      });

      assert.equal(response.statusCode, 200);

      const body = response.body as { id?: string; status?: string };

      assert.equal(body.id, boundTenantId);
      assert.equal(body.status, 'INACTIVE');
    });

    it('returns 403 for deactivate on another tenant id', async () => {
      const boundTenantId = await authorizeTenant(['TENANT_UPDATE', 'TENANT_CREATE']);
      const otherTenantId = await createOtherTenantViaApi();

      assert.notEqual(otherTenantId, boundTenantId);

      const response = await authorizedInject({
        method: 'POST',
        url: `/api/tenants/${otherTenantId}/deactivate`,
      });

      assert.equal(response.statusCode, 403);
      assertForbidden(response.body);
    });

    it('returns 403 without the required permission on the bound tenant', async () => {
      const boundTenantId = await authorizeTenant(['TENANT_CREATE']);

      const response = await authorizedInject({
        method: 'GET',
        url: `/api/tenants/${boundTenantId}`,
      });

      assert.equal(response.statusCode, 403);
      assertForbidden(response.body);
    });

    it('returns 401 without bearer token on scoped tenant routes', async () => {
      const response = await injectJson(app, {
        method: 'GET',
        url: `/api/tenants/${UNKNOWN_TENANT_ID}`,
      });

      assert.equal(response.statusCode, 401);
    });
  });

  describe('GET /api/tenants/:id', () => {
    it('returns an inactive bound tenant', async () => {
      const boundTenantId = await authorizeTenant([
        'TENANT_READ',
        'TENANT_UPDATE',
      ]);

      const deactivate = await authorizedInject({
        method: 'POST',
        url: `/api/tenants/${boundTenantId}/deactivate`,
      });

      assert.equal(deactivate.statusCode, 200);

      const response = await authorizedInject({
        method: 'GET',
        url: `/api/tenants/${boundTenantId}`,
      });

      assert.equal(response.statusCode, 200);

      const body = response.body as { status?: string; id?: string };

      assert.equal(body.id, boundTenantId);
      assert.equal(body.status, 'INACTIVE');
    });

    it('returns 400 for invalid id', async () => {
      await authorizeTenant(['TENANT_READ']);

      const response = await authorizedInject({
        method: 'GET',
        url: '/api/tenants/not-a-uuid',
      });

      assert.equal(response.statusCode, 400);
    });
  });
});

describe('Tenant HTTP OpenAPI (integration)', () => {
  it('documents tenant endpoints with security and error responses', async () => {
    const app = await createAuthHttpTestAppWithEnv({
      OPENAPI_ENABLED: 'true',
    });

    try {
      const response = await injectJson(app, {
        method: 'GET',
        url: '/docs/json',
      });

      assert.equal(response.statusCode, 200);

      const spec = response.body as {
        paths?: Record<string, Record<string, {
          responses?: Record<string, unknown>;
          security?: unknown[];
        }>>;
      };

      const tenantGet = spec.paths?.['/api/tenants/{id}']?.get;
      const tenantPost = spec.paths?.['/api/tenants']?.post;
      const activatePost = spec.paths?.['/api/tenants/{id}/activate']?.post;

      assert.ok(tenantGet);
      assert.ok(tenantPost);
      assert.ok(activatePost);

      assert.ok('401' in (tenantGet?.responses ?? {}));
      assert.ok('403' in (tenantGet?.responses ?? {}));
      assert.ok('404' in (tenantGet?.responses ?? {}));
      assert.ok('201' in (tenantPost?.responses ?? {}));
      assert.ok('409' in (tenantPost?.responses ?? {}));
      assert.deepEqual(tenantGet?.security, [{ bearerAuth: [] }]);
    }
    finally {
      await app.close();
    }
  });
});
