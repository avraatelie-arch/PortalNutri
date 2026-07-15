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
  seedPersonFixture,
  validCreatePersonPayload,
} from '../../../../test-support/person-http-test.harness.js';
import {
  bindSessionTenant,
  resetRbacFixtures,
  revokeGrantedPermission,
  seedRbacFixture,
  seedTenantOnly,
} from '../../../../test-support/rbac-test.harness.js';

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
  let sessionId: string;

  before(async () => {
    app = await createAuthHttpTestApp();
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

  async function authorizePersonWithPermissions(
    permissions: Array<'PERSON_READ' | 'PERSON_UPDATE' | 'PERSON_DELETE' | 'PERSON_CREATE'>,
    options?: {
      membershipActive?: boolean;
      assignRole?: boolean;
      grantPermissions?: boolean;
      tenantId?: string;
    },
  ) {
    const fixture = await seedRbacFixture({
      personId: authenticatedPersonId,
      permissions,
      membershipActive: options?.membershipActive,
      assignRole: options?.assignRole,
      grantPermissions: options?.grantPermissions,
    });

    await bindSessionTenant(sessionId, options?.tenantId ?? fixture.tenantId);

    return fixture;
  }

  describe('RBAC Person access', () => {
    it('allows GET when PERSON_READ is granted', async () => {
      await authorizePersonWithPermissions(['PERSON_READ']);

      const response = await authorizedInject({
        method: 'GET',
        url: `/api/iam/persons/${authenticatedPersonId}`,
      });

      assert.equal(response.statusCode, 200);

      const body = response.body as { id?: string };

      assert.equal(body.id, authenticatedPersonId);
    });

    it('allows PUT when PERSON_UPDATE is granted', async () => {
      await authorizePersonWithPermissions(['PERSON_UPDATE']);

      const response = await authorizedInject({
        method: 'PUT',
        url: `/api/iam/persons/${authenticatedPersonId}`,
        payload: {
          fullName: 'Updated RBAC Name',
        },
      });

      assert.equal(response.statusCode, 200);

      const body = response.body as { fullName?: string };

      assert.equal(body.fullName, 'Updated RBAC Name');
    });

    it('allows DELETE when PERSON_DELETE is granted', async () => {
      await authorizePersonWithPermissions(['PERSON_DELETE']);

      const response = await authorizedInject({
        method: 'DELETE',
        url: `/api/iam/persons/${authenticatedPersonId}`,
      });

      assert.equal(response.statusCode, 200);

      const body = response.body as { status?: string };

      assert.equal(body.status, 'INACTIVE');
    });

    it('returns 403 when PERSON_READ is not granted', async () => {
      await authorizePersonWithPermissions([]);

      const response = await authorizedInject({
        method: 'GET',
        url: `/api/iam/persons/${authenticatedPersonId}`,
      });

      assert.equal(response.statusCode, 403);
      assertForbidden(response.body);
    });

    it('returns 403 when membership is missing', async () => {
      const tenantId = await seedTenantOnly(`no-membership-${Date.now()}`);
      await bindSessionTenant(sessionId, tenantId);

      const response = await authorizedInject({
        method: 'GET',
        url: `/api/iam/persons/${authenticatedPersonId}`,
      });

      assert.equal(response.statusCode, 403);
      assertForbidden(response.body);
    });

    it('returns 403 when membership is inactive', async () => {
      await authorizePersonWithPermissions(['PERSON_READ'], {
        membershipActive: false,
      });

      const response = await authorizedInject({
        method: 'GET',
        url: `/api/iam/persons/${authenticatedPersonId}`,
      });

      assert.equal(response.statusCode, 403);
      assertForbidden(response.body);
    });

    it('returns 403 when role assignment is missing', async () => {
      await authorizePersonWithPermissions(['PERSON_READ'], {
        assignRole: false,
      });

      const response = await authorizedInject({
        method: 'GET',
        url: `/api/iam/persons/${authenticatedPersonId}`,
      });

      assert.equal(response.statusCode, 403);
      assertForbidden(response.body);
    });

    it('returns 403 when permission assignment is missing', async () => {
      await authorizePersonWithPermissions(['PERSON_READ'], {
        grantPermissions: false,
      });

      const response = await authorizedInject({
        method: 'GET',
        url: `/api/iam/persons/${authenticatedPersonId}`,
      });

      assert.equal(response.statusCode, 403);
      assertForbidden(response.body);
    });

    it('returns 403 when permission assignment is inactive', async () => {
      const fixture = await authorizePersonWithPermissions(['PERSON_READ']);

      await revokeGrantedPermission({
        roleId: fixture.roleId,
        permissionId: fixture.permissionIds.PERSON_READ!,
      });

      const response = await authorizedInject({
        method: 'GET',
        url: `/api/iam/persons/${authenticatedPersonId}`,
      });

      assert.equal(response.statusCode, 403);
      assertForbidden(response.body);
    });

    it('returns 403 for cross-tenant denial', async () => {
      await authorizePersonWithPermissions(['PERSON_READ']);
      const otherTenantId = await seedTenantOnly(`other-tenant-${Date.now()}`);

      await bindSessionTenant(sessionId, otherTenantId);

      const response = await authorizedInject({
        method: 'GET',
        url: `/api/iam/persons/${authenticatedPersonId}`,
      });

      assert.equal(response.statusCode, 403);
      assertForbidden(response.body);
    });

    it('allows GET on another person when PERSON_READ is granted', async () => {
      await authorizePersonWithPermissions(['PERSON_READ']);

      const other = await seedPersonFixture({
        documentValue: 'AUTHZ001',
      });

      const response = await authorizedInject({
        method: 'GET',
        url: `/api/iam/persons/${other.personId}`,
      });

      assert.equal(response.statusCode, 200);
    });
  });

  describe('Person creation', () => {
    it('returns 403 for POST Person without PERSON_CREATE', async () => {
      await authorizePersonWithPermissions(['PERSON_READ']);

      const response = await authorizedInject({
        method: 'POST',
        url: '/api/iam/persons',
        payload: validCreatePersonPayload(),
      });

      assert.equal(response.statusCode, 403);
      assertForbidden(response.body);
    });

    it('allows POST Person when PERSON_CREATE is granted', async () => {
      await authorizePersonWithPermissions(['PERSON_CREATE']);

      const response = await authorizedInject({
        method: 'POST',
        url: '/api/iam/persons',
        payload: validCreatePersonPayload(),
      });

      assert.equal(response.statusCode, 201);
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
        await resetRbacFixtures();
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

  describe('nonexistent resource', () => {
    it('returns 403 for GET on a nonexistent Person id without permission', async () => {
      const response = await authorizedInject({
        method: 'GET',
        url: `/api/iam/persons/${UNKNOWN_PERSON_ID}`,
      });

      assert.equal(response.statusCode, 403);
      assertForbidden(response.body);
    });

    it('returns 404 for GET on a nonexistent Person id with PERSON_READ', async () => {
      await authorizePersonWithPermissions(['PERSON_READ']);

      const response = await authorizedInject({
        method: 'GET',
        url: `/api/iam/persons/${UNKNOWN_PERSON_ID}`,
      });

      assert.equal(response.statusCode, 404);
    });
  });
});
