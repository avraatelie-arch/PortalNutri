import assert from 'node:assert/strict';
import { after, before, beforeEach, describe, it } from 'node:test';
import type { FastifyInstance } from 'fastify';
import { getPrismaClient } from '../../../../core/database/prisma-client.js';
import { FORBIDDEN_MESSAGE } from '../../application/authorization/forbidden-response.js';
import { AddPersonToTenantCommand } from '../../application/add-person-to-tenant/add-person-to-tenant.command.js';
import { AddPersonToTenantHandler } from '../../application/add-person-to-tenant/add-person-to-tenant.handler.js';
import {
  createAuthHttpTestAppWithEnv,
  grantMembershipPermissions,
  seedAuthenticatedFixture,
  withBearerToken,
} from '../../../../test-support/auth-http-test.harness.js';
import {
  createMembershipHttpTestApp,
  injectJson,
  requireDatabaseUrl,
} from '../../../../test-support/membership-http-test.harness.js';
import { noopEventDispatcher } from '../../../../test-support/noop-event-dispatcher.js';
import {
  resetRbacFixtures,
  seedTenantOnly,
} from '../../../../test-support/rbac-test.harness.js';
import { seedPersonFixture } from '../../../../test-support/person-http-test.harness.js';
import { PrismaMembershipRepository } from '../../infrastructure/repositories/prisma-membership.repository.js';
import { PrismaPersonRepository } from '../../infrastructure/repositories/prisma-person.repository.js';
import { PrismaTenantRepository } from '../../infrastructure/repositories/prisma-tenant.repository.js';

requireDatabaseUrl();

const UNKNOWN_MEMBERSHIP_ID = '550e8400-e29b-41d4-a716-446655440099';

function assertForbidden(body: unknown) {
  assert.deepEqual(body, {
    statusCode: 403,
    error: 'Forbidden',
    message: FORBIDDEN_MESSAGE,
  });
}

async function seedForeignMembership(): Promise<{
  membershipId: string;
  tenantId: string;
  personId: string;
}> {
  const prisma = getPrismaClient();
  const person = await seedPersonFixture();
  const tenantId = await seedTenantOnly(`foreign-${Date.now()}`);
  const membership = await new AddPersonToTenantHandler(
    new PrismaMembershipRepository(prisma),
    new PrismaPersonRepository(prisma),
    new PrismaTenantRepository(prisma),
    noopEventDispatcher,
  ).execute(
    new AddPersonToTenantCommand({
      personId: person.personId,
      tenantId,
    }),
  );

  return {
    membershipId: membership.id,
    tenantId,
    personId: person.personId,
  };
}

describe('Membership HTTP routes (integration)', () => {
  let app: FastifyInstance;
  let accessToken: string;
  let authenticatedPersonId: string;
  let sessionId: string;

  before(async () => {
    app = await createMembershipHttpTestApp();
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

  async function authorizeMembership(
    permissions: Array<'MEMBERSHIP_READ' | 'MEMBERSHIP_CREATE' | 'MEMBERSHIP_DELETE'>,
  ): Promise<string> {
    return grantMembershipPermissions(
      authenticatedPersonId,
      sessionId,
      permissions,
    );
  }

  async function createMembershipViaApi(params: {
    personId: string;
    tenantId: string;
  }): Promise<{ statusCode: number; body: unknown }> {
    return authorizedInject({
      method: 'POST',
      url: '/api/memberships',
      payload: {
        personId: params.personId,
        tenantId: params.tenantId,
      },
    });
  }

  describe('POST /api/memberships', () => {
    it('creates a membership with 201', async () => {
      const boundTenantId = await authorizeMembership(['MEMBERSHIP_CREATE']);
      const person = await seedPersonFixture();

      const response = await createMembershipViaApi({
        personId: person.personId,
        tenantId: boundTenantId,
      });

      assert.equal(response.statusCode, 201);

      const body = response.body as {
        id?: string;
        personId?: string;
        tenantId?: string;
        status?: string;
        operation?: string;
      };

      assert.match(body.id ?? '', /^[0-9a-f-]{36}$/i);
      assert.equal(body.personId, person.personId);
      assert.equal(body.tenantId, boundTenantId);
      assert.equal(body.status, 'ACTIVE');
      assert.equal(body.operation, undefined);
    });

    it('reactivates a removed membership with 200', async () => {
      const boundTenantId = await authorizeMembership([
        'MEMBERSHIP_CREATE',
        'MEMBERSHIP_DELETE',
      ]);
      const person = await seedPersonFixture();

      const created = await createMembershipViaApi({
        personId: person.personId,
        tenantId: boundTenantId,
      });

      assert.equal(created.statusCode, 201);

      const removed = await authorizedInject({
        method: 'DELETE',
        url: `/api/memberships/${person.personId}/${boundTenantId}`,
      });

      assert.equal(removed.statusCode, 200);

      const reactivated = await createMembershipViaApi({
        personId: person.personId,
        tenantId: boundTenantId,
      });

      assert.equal(reactivated.statusCode, 200);

      const body = reactivated.body as {
        id?: string;
        status?: string;
        reactivatedAt?: string | null;
        operation?: string;
      };

      assert.equal(body.id, (created.body as { id: string }).id);
      assert.equal(body.status, 'ACTIVE');
      assert.ok(body.reactivatedAt);
      assert.equal(body.operation, undefined);
    });

    it('returns 409 for an active duplicate membership', async () => {
      const boundTenantId = await authorizeMembership(['MEMBERSHIP_CREATE']);
      const person = await seedPersonFixture();

      const first = await createMembershipViaApi({
        personId: person.personId,
        tenantId: boundTenantId,
      });

      assert.equal(first.statusCode, 201);

      const duplicate = await createMembershipViaApi({
        personId: person.personId,
        tenantId: boundTenantId,
      });

      assert.equal(duplicate.statusCode, 409);
    });

    it('returns 403 for POST on a foreign tenant id', async () => {
      const boundTenantId = await authorizeMembership(['MEMBERSHIP_CREATE']);
      const foreignTenantId = await seedTenantOnly(`post-foreign-${Date.now()}`);
      const person = await seedPersonFixture();
      const prisma = getPrismaClient();
      const beforeCount = await prisma.membership.count();

      assert.notEqual(foreignTenantId, boundTenantId);

      const response = await createMembershipViaApi({
        personId: person.personId,
        tenantId: foreignTenantId,
      });

      assert.equal(response.statusCode, 403);
      assertForbidden(response.body);

      const afterCount = await prisma.membership.count();
      assert.equal(afterCount, beforeCount);
    });

    it('returns 401 without bearer token', async () => {
      const response = await injectJson(app, {
        method: 'POST',
        url: '/api/memberships',
        payload: {
          personId: authenticatedPersonId,
          tenantId: UNKNOWN_MEMBERSHIP_ID,
        },
      });

      assert.equal(response.statusCode, 401);
    });

    it('returns 403 without MEMBERSHIP_CREATE', async () => {
      const boundTenantId = await authorizeMembership(['MEMBERSHIP_READ']);
      const person = await seedPersonFixture();

      const response = await createMembershipViaApi({
        personId: person.personId,
        tenantId: boundTenantId,
      });

      assert.equal(response.statusCode, 403);
      assertForbidden(response.body);
    });
  });

  describe('GET /api/memberships/:id', () => {
    it('returns own-tenant membership with 200', async () => {
      const boundTenantId = await authorizeMembership([
        'MEMBERSHIP_READ',
        'MEMBERSHIP_CREATE',
      ]);
      const person = await seedPersonFixture();

      const created = await createMembershipViaApi({
        personId: person.personId,
        tenantId: boundTenantId,
      });

      assert.equal(created.statusCode, 201);

      const response = await authorizedInject({
        method: 'GET',
        url: `/api/memberships/${(created.body as { id: string }).id}`,
      });

      assert.equal(response.statusCode, 200);

      const body = response.body as { id?: string; tenantId?: string };

      assert.equal(body.id, (created.body as { id: string }).id);
      assert.equal(body.tenantId, boundTenantId);
    });

    it('returns 403 for a foreign membership id', async () => {
      await authorizeMembership(['MEMBERSHIP_READ']);
      const foreign = await seedForeignMembership();

      const response = await authorizedInject({
        method: 'GET',
        url: `/api/memberships/${foreign.membershipId}`,
      });

      assert.equal(response.statusCode, 403);
      assertForbidden(response.body);
    });

    it('returns 403 for an unknown membership id without revealing existence', async () => {
      await authorizeMembership(['MEMBERSHIP_READ']);

      const response = await authorizedInject({
        method: 'GET',
        url: `/api/memberships/${UNKNOWN_MEMBERSHIP_ID}`,
      });

      assert.equal(response.statusCode, 403);
      assertForbidden(response.body);
    });

    it('returns 401 without bearer token', async () => {
      const response = await injectJson(app, {
        method: 'GET',
        url: `/api/memberships/${UNKNOWN_MEMBERSHIP_ID}`,
      });

      assert.equal(response.statusCode, 401);
    });

    it('returns 403 without MEMBERSHIP_READ', async () => {
      const boundTenantId = await authorizeMembership(['MEMBERSHIP_CREATE']);
      const person = await seedPersonFixture();

      const created = await createMembershipViaApi({
        personId: person.personId,
        tenantId: boundTenantId,
      });

      assert.equal(created.statusCode, 201);

      const response = await authorizedInject({
        method: 'GET',
        url: `/api/memberships/${(created.body as { id: string }).id}`,
      });

      assert.equal(response.statusCode, 403);
      assertForbidden(response.body);
    });
  });

  describe('DELETE /api/memberships/:personId/:tenantId', () => {
    it('removes own-tenant membership with 200', async () => {
      const boundTenantId = await authorizeMembership([
        'MEMBERSHIP_CREATE',
        'MEMBERSHIP_DELETE',
      ]);
      const person = await seedPersonFixture();

      const created = await createMembershipViaApi({
        personId: person.personId,
        tenantId: boundTenantId,
      });

      assert.equal(created.statusCode, 201);

      const response = await authorizedInject({
        method: 'DELETE',
        url: `/api/memberships/${person.personId}/${boundTenantId}`,
      });

      assert.equal(response.statusCode, 200);

      const body = response.body as { status?: string };

      assert.equal(body.status, 'REMOVED');
    });

    it('returns 403 for DELETE on a foreign tenant id', async () => {
      const boundTenantId = await authorizeMembership(['MEMBERSHIP_DELETE']);
      const foreign = await seedForeignMembership();

      assert.notEqual(foreign.tenantId, boundTenantId);

      const response = await authorizedInject({
        method: 'DELETE',
        url: `/api/memberships/${foreign.personId}/${foreign.tenantId}`,
      });

      assert.equal(response.statusCode, 403);
      assertForbidden(response.body);
    });

    it('returns 404 for missing membership in the bound tenant', async () => {
      const boundTenantId = await authorizeMembership(['MEMBERSHIP_DELETE']);
      const person = await seedPersonFixture();

      const response = await authorizedInject({
        method: 'DELETE',
        url: `/api/memberships/${person.personId}/${boundTenantId}`,
      });

      assert.equal(response.statusCode, 404);
    });

    it('returns 401 without bearer token', async () => {
      const response = await injectJson(app, {
        method: 'DELETE',
        url: `/api/memberships/${authenticatedPersonId}/${UNKNOWN_MEMBERSHIP_ID}`,
      });

      assert.equal(response.statusCode, 401);
    });

    it('returns 403 without MEMBERSHIP_DELETE', async () => {
      const boundTenantId = await authorizeMembership(['MEMBERSHIP_CREATE']);
      const person = await seedPersonFixture();

      await createMembershipViaApi({
        personId: person.personId,
        tenantId: boundTenantId,
      });

      const response = await authorizedInject({
        method: 'DELETE',
        url: `/api/memberships/${person.personId}/${boundTenantId}`,
      });

      assert.equal(response.statusCode, 403);
      assertForbidden(response.body);
    });
  });

  describe('Authorization scope prevents handler execution', () => {
    it('does not run GET handler when membership scope resolution fails', async () => {
      await authorizeMembership(['MEMBERSHIP_READ']);

      const response = await authorizedInject({
        method: 'GET',
        url: `/api/memberships/${UNKNOWN_MEMBERSHIP_ID}`,
      });

      assert.equal(response.statusCode, 403);
      assertForbidden(response.body);
      assert.notEqual(
        (response.body as { statusCode?: number }).statusCode,
        404,
      );
    });

    it('does not run POST handler when tenant scope mismatches', async () => {
      const boundTenantId = await authorizeMembership(['MEMBERSHIP_CREATE']);
      const foreignTenantId = await seedTenantOnly(`scope-${Date.now()}`);
      const person = await seedPersonFixture();
      const prisma = getPrismaClient();
      const beforeCount = await prisma.membership.count({
        where: {
          personId: person.personId,
          tenantId: foreignTenantId,
        },
      });

      const response = await createMembershipViaApi({
        personId: person.personId,
        tenantId: foreignTenantId,
      });

      assert.equal(response.statusCode, 403);
      assertForbidden(response.body);
      assert.notEqual(foreignTenantId, boundTenantId);

      const afterCount = await prisma.membership.count({
        where: {
          personId: person.personId,
          tenantId: foreignTenantId,
        },
      });

      assert.equal(afterCount, beforeCount);
    });
  });
});

describe('Membership HTTP OpenAPI (integration)', () => {
  it('documents membership endpoints with security and response codes', async () => {
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

      const membershipPost = spec.paths?.['/api/memberships']?.post;
      const membershipGet = spec.paths?.['/api/memberships/{id}']?.get;
      const membershipDelete =
        spec.paths?.['/api/memberships/{personId}/{tenantId}']?.delete;

      assert.ok(membershipPost);
      assert.ok(membershipGet);
      assert.ok(membershipDelete);

      assert.ok('201' in (membershipPost?.responses ?? {}));
      assert.ok('200' in (membershipPost?.responses ?? {}));
      assert.ok('409' in (membershipPost?.responses ?? {}));
      assert.ok('403' in (membershipPost?.responses ?? {}));
      assert.ok('401' in (membershipPost?.responses ?? {}));

      assert.ok('200' in (membershipGet?.responses ?? {}));
      assert.ok('403' in (membershipGet?.responses ?? {}));
      assert.ok('401' in (membershipGet?.responses ?? {}));
      assert.equal('404' in (membershipGet?.responses ?? {}), false);

      assert.ok('200' in (membershipDelete?.responses ?? {}));
      assert.ok('404' in (membershipDelete?.responses ?? {}));
      assert.ok('403' in (membershipDelete?.responses ?? {}));
      assert.ok('401' in (membershipDelete?.responses ?? {}));

      assert.deepEqual(membershipPost?.security, [{ bearerAuth: [] }]);
      assert.deepEqual(membershipGet?.security, [{ bearerAuth: [] }]);
      assert.deepEqual(membershipDelete?.security, [{ bearerAuth: [] }]);
    }
    finally {
      await app.close();
    }
  });
});
