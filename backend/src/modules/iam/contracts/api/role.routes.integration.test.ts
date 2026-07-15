import assert from 'node:assert/strict';
import { after, before, beforeEach, describe, it } from 'node:test';
import type { FastifyInstance } from 'fastify';
import { getPrismaClient } from '../../../../core/database/prisma-client.js';
import { FORBIDDEN_MESSAGE } from '../../application/authorization/forbidden-response.js';
import { AddPersonToTenantCommand } from '../../application/add-person-to-tenant/add-person-to-tenant.command.js';
import { AddPersonToTenantHandler } from '../../application/add-person-to-tenant/add-person-to-tenant.handler.js';
import { AssignRoleCommand } from '../../application/assign-role/assign-role.command.js';
import { AssignRoleHandler } from '../../application/assign-role/assign-role.handler.js';
import { CreateRoleCommand } from '../../application/create-role/create-role.command.js';
import { CreateRoleHandler } from '../../application/create-role/create-role.handler.js';
import {
  createAuthHttpTestAppWithEnv,
  grantRolePermissions,
  seedAuthenticatedFixture,
  withBearerToken,
} from '../../../../test-support/auth-http-test.harness.js';
import { noopEventDispatcher } from '../../../../test-support/noop-event-dispatcher.js';
import { seedPersonFixture } from '../../../../test-support/person-http-test.harness.js';
import {
  createRoleHttpTestApp,
  injectJson,
  requireDatabaseUrl,
  validCreateRolePayload,
} from '../../../../test-support/role-http-test.harness.js';
import {
  resetRbacFixtures,
  seedTenantOnly,
} from '../../../../test-support/rbac-test.harness.js';
import { PrismaMembershipRepository } from '../../infrastructure/repositories/prisma-membership.repository.js';
import { PrismaPersonRepository } from '../../infrastructure/repositories/prisma-person.repository.js';
import { PrismaRoleAssignmentRepository } from '../../infrastructure/repositories/prisma-role-assignment.repository.js';
import { PrismaRoleRepository } from '../../infrastructure/repositories/prisma-role.repository.js';
import { PrismaTenantRepository } from '../../infrastructure/repositories/prisma-tenant.repository.js';

requireDatabaseUrl();

const UNKNOWN_ROLE_ID = '550e8400-e29b-41d4-a716-446655440099';
const UNKNOWN_ROLE_ASSIGNMENT_ID = '550e8400-e29b-41d4-a716-446655440098';

function assertForbidden(body: unknown) {
  assert.deepEqual(body, {
    statusCode: 403,
    error: 'Forbidden',
    message: FORBIDDEN_MESSAGE,
  });
}

async function findMembershipId(
  personId: string,
  tenantId: string,
): Promise<string> {
  const prisma = getPrismaClient();
  const membership = await prisma.membership.findFirst({
    where: { personId, tenantId },
  });

  if (!membership) {
    throw new Error('Membership not found for seeded fixture.');
  }

  return membership.id;
}

async function seedForeignRole(name = 'Foreign Role'): Promise<{
  roleId: string;
  tenantId: string;
}> {
  const prisma = getPrismaClient();
  const tenantId = await seedTenantOnly(`foreign-role-${Date.now()}`);
  const role = await new CreateRoleHandler(
    new PrismaRoleRepository(prisma),
    new PrismaTenantRepository(prisma),
    noopEventDispatcher,
  ).execute(
    new CreateRoleCommand({
      tenantId,
      name,
    }),
  );

  return {
    roleId: role.id,
    tenantId,
  };
}

async function seedForeignRoleAssignment(): Promise<{
  roleAssignmentId: string;
  membershipId: string;
  roleId: string;
  tenantId: string;
}> {
  const prisma = getPrismaClient();
  const person = await seedPersonFixture();
  const tenantId = await seedTenantOnly(`foreign-assignment-${Date.now()}`);
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
  const role = await new CreateRoleHandler(
    new PrismaRoleRepository(prisma),
    new PrismaTenantRepository(prisma),
    noopEventDispatcher,
  ).execute(
    new CreateRoleCommand({
      tenantId,
      name: 'Foreign Assignment Role',
    }),
  );
  const assignment = await new AssignRoleHandler(
    new PrismaRoleAssignmentRepository(prisma),
    new PrismaMembershipRepository(prisma),
    new PrismaRoleRepository(prisma),
    noopEventDispatcher,
  ).execute(
    new AssignRoleCommand({
      membershipId: membership.id,
      roleId: role.id,
    }),
  );

  return {
    roleAssignmentId: assignment.id,
    membershipId: membership.id,
    roleId: role.id,
    tenantId,
  };
}

describe('Role HTTP routes (integration)', () => {
  let app: FastifyInstance;
  let accessToken: string;
  let authenticatedPersonId: string;
  let sessionId: string;

  before(async () => {
    app = await createRoleHttpTestApp();
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

  async function authorizeRole(
    permissions: Array<
      'ROLE_READ' | 'ROLE_CREATE' | 'ROLE_ASSIGN' | 'ROLE_ASSIGNMENT_READ' | 'ROLE_REMOVE'
    >,
  ): Promise<string> {
    return grantRolePermissions(
      authenticatedPersonId,
      sessionId,
      permissions,
    );
  }

  async function createRoleViaApi(params: {
    tenantId: string;
    name?: string;
  }): Promise<{ statusCode: number; body: unknown }> {
    return authorizedInject({
      method: 'POST',
      url: '/api/roles',
      payload: {
        tenantId: params.tenantId,
        name: params.name ?? validCreateRolePayload(params.tenantId).name,
      },
    });
  }

  async function createRoleAssignmentViaApi(params: {
    membershipId: string;
    roleId: string;
  }): Promise<{ statusCode: number; body: unknown }> {
    return authorizedInject({
      method: 'POST',
      url: '/api/role-assignments',
      payload: {
        membershipId: params.membershipId,
        roleId: params.roleId,
      },
    });
  }

  describe('POST /api/roles', () => {
    it('creates a role with 201', async () => {
      const boundTenantId = await authorizeRole(['ROLE_CREATE']);
      const payload = validCreateRolePayload(boundTenantId);

      const response = await createRoleViaApi({
        tenantId: boundTenantId,
        name: payload.name,
      });

      assert.equal(response.statusCode, 201);

      const body = response.body as {
        id?: string;
        tenantId?: string;
        name?: string;
        createdAt?: string;
      };

      assert.match(body.id ?? '', /^[0-9a-f-]{36}$/i);
      assert.equal(body.tenantId, boundTenantId);
      assert.equal(body.name, payload.name);
      assert.ok(body.createdAt);
    });

    it('returns 409 for a duplicate role name in the same tenant', async () => {
      const boundTenantId = await authorizeRole(['ROLE_CREATE']);
      const payload = validCreateRolePayload(boundTenantId, 'duplicate');

      const first = await createRoleViaApi({
        tenantId: boundTenantId,
        name: payload.name,
      });

      assert.equal(first.statusCode, 201);

      const duplicate = await createRoleViaApi({
        tenantId: boundTenantId,
        name: payload.name,
      });

      assert.equal(duplicate.statusCode, 409);
    });

    it('allows the same role name in another tenant', async () => {
      const boundTenantId = await authorizeRole(['ROLE_CREATE']);
      const sharedName = 'Shared Clinic Role';
      const foreign = await seedForeignRole(sharedName);

      const response = await createRoleViaApi({
        tenantId: boundTenantId,
        name: sharedName,
      });

      assert.equal(response.statusCode, 201);

      const body = response.body as { tenantId?: string; name?: string };

      assert.equal(body.tenantId, boundTenantId);
      assert.equal(body.name, sharedName);
      assert.notEqual(foreign.tenantId, boundTenantId);
    });

    it('returns 400 for an invalid payload', async () => {
      const boundTenantId = await authorizeRole(['ROLE_CREATE']);

      const response = await authorizedInject({
        method: 'POST',
        url: '/api/roles',
        payload: {
          tenantId: boundTenantId,
          name: 'A',
        },
      });

      assert.equal(response.statusCode, 400);
    });

    it('returns 403 for POST on a foreign tenant id', async () => {
      const boundTenantId = await authorizeRole(['ROLE_CREATE']);
      const foreignTenantId = await seedTenantOnly(`post-foreign-${Date.now()}`);
      const prisma = getPrismaClient();
      const beforeCount = await prisma.role.count();

      assert.notEqual(foreignTenantId, boundTenantId);

      const response = await createRoleViaApi({
        tenantId: foreignTenantId,
        name: 'Foreign Tenant Role',
      });

      assert.equal(response.statusCode, 403);
      assertForbidden(response.body);

      const afterCount = await prisma.role.count();
      assert.equal(afterCount, beforeCount);
    });

    it('returns 401 without bearer token', async () => {
      const response = await injectJson(app, {
        method: 'POST',
        url: '/api/roles',
        payload: validCreateRolePayload(UNKNOWN_ROLE_ID),
      });

      assert.equal(response.statusCode, 401);
    });

    it('returns 403 without ROLE_CREATE', async () => {
      const boundTenantId = await authorizeRole(['ROLE_READ']);

      const response = await createRoleViaApi({
        tenantId: boundTenantId,
      });

      assert.equal(response.statusCode, 403);
      assertForbidden(response.body);
    });
  });

  describe('GET /api/roles/:id', () => {
    it('returns own-tenant role with 200', async () => {
      const boundTenantId = await authorizeRole(['ROLE_READ', 'ROLE_CREATE']);

      const created = await createRoleViaApi({ tenantId: boundTenantId });

      assert.equal(created.statusCode, 201);

      const response = await authorizedInject({
        method: 'GET',
        url: `/api/roles/${(created.body as { id: string }).id}`,
      });

      assert.equal(response.statusCode, 200);

      const body = response.body as { id?: string; tenantId?: string };

      assert.equal(body.id, (created.body as { id: string }).id);
      assert.equal(body.tenantId, boundTenantId);
    });

    it('returns 403 for a foreign role id', async () => {
      await authorizeRole(['ROLE_READ']);
      const foreign = await seedForeignRole();

      const response = await authorizedInject({
        method: 'GET',
        url: `/api/roles/${foreign.roleId}`,
      });

      assert.equal(response.statusCode, 403);
      assertForbidden(response.body);
    });

    it('returns 403 for an unknown role id without revealing existence', async () => {
      await authorizeRole(['ROLE_READ']);

      const response = await authorizedInject({
        method: 'GET',
        url: `/api/roles/${UNKNOWN_ROLE_ID}`,
      });

      assert.equal(response.statusCode, 403);
      assertForbidden(response.body);
    });

    it('returns 401 without bearer token', async () => {
      const response = await injectJson(app, {
        method: 'GET',
        url: `/api/roles/${UNKNOWN_ROLE_ID}`,
      });

      assert.equal(response.statusCode, 401);
    });

    it('returns 403 without ROLE_READ', async () => {
      const boundTenantId = await authorizeRole(['ROLE_CREATE']);

      const created = await createRoleViaApi({ tenantId: boundTenantId });

      assert.equal(created.statusCode, 201);

      const response = await authorizedInject({
        method: 'GET',
        url: `/api/roles/${(created.body as { id: string }).id}`,
      });

      assert.equal(response.statusCode, 403);
      assertForbidden(response.body);
    });
  });

  describe('POST /api/role-assignments', () => {
    it('creates a role assignment with 201', async () => {
      const boundTenantId = await authorizeRole(['ROLE_ASSIGN', 'ROLE_CREATE']);
      const membershipId = await findMembershipId(
        authenticatedPersonId,
        boundTenantId,
      );
      const createdRole = await createRoleViaApi({ tenantId: boundTenantId });

      assert.equal(createdRole.statusCode, 201);

      const response = await createRoleAssignmentViaApi({
        membershipId,
        roleId: (createdRole.body as { id: string }).id,
      });

      assert.equal(response.statusCode, 201);

      const body = response.body as {
        id?: string;
        membershipId?: string;
        roleId?: string;
        status?: string;
      };

      assert.match(body.id ?? '', /^[0-9a-f-]{36}$/i);
      assert.equal(body.membershipId, membershipId);
      assert.equal(body.roleId, (createdRole.body as { id: string }).id);
      assert.equal(body.status, 'ACTIVE');
    });

    it('reactivates a removed role assignment with 200', async () => {
      const boundTenantId = await authorizeRole([
        'ROLE_ASSIGN',
        'ROLE_CREATE',
        'ROLE_REMOVE',
      ]);
      const membershipId = await findMembershipId(
        authenticatedPersonId,
        boundTenantId,
      );
      const createdRole = await createRoleViaApi({ tenantId: boundTenantId });

      assert.equal(createdRole.statusCode, 201);

      const roleId = (createdRole.body as { id: string }).id;

      const created = await createRoleAssignmentViaApi({
        membershipId,
        roleId,
      });

      assert.equal(created.statusCode, 201);

      const removed = await authorizedInject({
        method: 'DELETE',
        url: `/api/role-assignments/${membershipId}/${roleId}`,
      });

      assert.equal(removed.statusCode, 200);

      const reactivated = await createRoleAssignmentViaApi({
        membershipId,
        roleId,
      });

      assert.equal(reactivated.statusCode, 200);

      const body = reactivated.body as {
        id?: string;
        status?: string;
        reactivatedAt?: string | null;
      };

      assert.equal(body.id, (created.body as { id: string }).id);
      assert.equal(body.status, 'ACTIVE');
      assert.ok(body.reactivatedAt);
    });

    it('returns 409 for an active duplicate role assignment', async () => {
      const boundTenantId = await authorizeRole(['ROLE_ASSIGN', 'ROLE_CREATE']);
      const membershipId = await findMembershipId(
        authenticatedPersonId,
        boundTenantId,
      );
      const createdRole = await createRoleViaApi({ tenantId: boundTenantId });

      assert.equal(createdRole.statusCode, 201);

      const roleId = (createdRole.body as { id: string }).id;

      const first = await createRoleAssignmentViaApi({
        membershipId,
        roleId,
      });

      assert.equal(first.statusCode, 201);

      const duplicate = await createRoleAssignmentViaApi({
        membershipId,
        roleId,
      });

      assert.equal(duplicate.statusCode, 409);
    });

    it('returns 403 for a cross-tenant role assignment', async () => {
      const boundTenantId = await authorizeRole(['ROLE_ASSIGN']);
      const membershipId = await findMembershipId(
        authenticatedPersonId,
        boundTenantId,
      );
      const foreign = await seedForeignRole();
      const prisma = getPrismaClient();
      const beforeCount = await prisma.roleAssignment.count();

      const response = await createRoleAssignmentViaApi({
        membershipId,
        roleId: foreign.roleId,
      });

      assert.equal(response.statusCode, 403);
      assertForbidden(response.body);

      const afterCount = await prisma.roleAssignment.count();
      assert.equal(afterCount, beforeCount);
    });

    it('returns 401 without bearer token', async () => {
      const response = await injectJson(app, {
        method: 'POST',
        url: '/api/role-assignments',
        payload: {
          membershipId: UNKNOWN_ROLE_ASSIGNMENT_ID,
          roleId: UNKNOWN_ROLE_ID,
        },
      });

      assert.equal(response.statusCode, 401);
    });

    it('returns 403 without ROLE_ASSIGN', async () => {
      const boundTenantId = await authorizeRole(['ROLE_CREATE']);
      const membershipId = await findMembershipId(
        authenticatedPersonId,
        boundTenantId,
      );
      const createdRole = await createRoleViaApi({ tenantId: boundTenantId });

      assert.equal(createdRole.statusCode, 201);

      const response = await createRoleAssignmentViaApi({
        membershipId,
        roleId: (createdRole.body as { id: string }).id,
      });

      assert.equal(response.statusCode, 403);
      assertForbidden(response.body);
    });
  });

  describe('GET /api/role-assignments/:id', () => {
    it('returns own-tenant role assignment with 200', async () => {
      const boundTenantId = await authorizeRole([
        'ROLE_ASSIGN',
        'ROLE_CREATE',
        'ROLE_ASSIGNMENT_READ',
      ]);
      const membershipId = await findMembershipId(
        authenticatedPersonId,
        boundTenantId,
      );
      const createdRole = await createRoleViaApi({ tenantId: boundTenantId });

      assert.equal(createdRole.statusCode, 201);

      const created = await createRoleAssignmentViaApi({
        membershipId,
        roleId: (createdRole.body as { id: string }).id,
      });

      assert.equal(created.statusCode, 201);

      const response = await authorizedInject({
        method: 'GET',
        url: `/api/role-assignments/${(created.body as { id: string }).id}`,
      });

      assert.equal(response.statusCode, 200);

      const body = response.body as { id?: string; membershipId?: string };

      assert.equal(body.id, (created.body as { id: string }).id);
      assert.equal(body.membershipId, membershipId);
    });

    it('returns 403 for a foreign role assignment id', async () => {
      await authorizeRole(['ROLE_ASSIGNMENT_READ']);
      const foreign = await seedForeignRoleAssignment();

      const response = await authorizedInject({
        method: 'GET',
        url: `/api/role-assignments/${foreign.roleAssignmentId}`,
      });

      assert.equal(response.statusCode, 403);
      assertForbidden(response.body);
    });

    it('returns 403 for an unknown role assignment id without revealing existence', async () => {
      await authorizeRole(['ROLE_ASSIGNMENT_READ']);

      const response = await authorizedInject({
        method: 'GET',
        url: `/api/role-assignments/${UNKNOWN_ROLE_ASSIGNMENT_ID}`,
      });

      assert.equal(response.statusCode, 403);
      assertForbidden(response.body);
    });

    it('returns 401 without bearer token', async () => {
      const response = await injectJson(app, {
        method: 'GET',
        url: `/api/role-assignments/${UNKNOWN_ROLE_ASSIGNMENT_ID}`,
      });

      assert.equal(response.statusCode, 401);
    });

    it('returns 403 without ROLE_ASSIGNMENT_READ', async () => {
      const boundTenantId = await authorizeRole(['ROLE_ASSIGN', 'ROLE_CREATE']);
      const membershipId = await findMembershipId(
        authenticatedPersonId,
        boundTenantId,
      );
      const createdRole = await createRoleViaApi({ tenantId: boundTenantId });

      assert.equal(createdRole.statusCode, 201);

      const created = await createRoleAssignmentViaApi({
        membershipId,
        roleId: (createdRole.body as { id: string }).id,
      });

      assert.equal(created.statusCode, 201);

      const response = await authorizedInject({
        method: 'GET',
        url: `/api/role-assignments/${(created.body as { id: string }).id}`,
      });

      assert.equal(response.statusCode, 403);
      assertForbidden(response.body);
    });
  });

  describe('DELETE /api/role-assignments/:membershipId/:roleId', () => {
    it('removes own-tenant role assignment with 200', async () => {
      const boundTenantId = await authorizeRole([
        'ROLE_ASSIGN',
        'ROLE_CREATE',
        'ROLE_REMOVE',
      ]);
      const membershipId = await findMembershipId(
        authenticatedPersonId,
        boundTenantId,
      );
      const createdRole = await createRoleViaApi({ tenantId: boundTenantId });

      assert.equal(createdRole.statusCode, 201);

      const roleId = (createdRole.body as { id: string }).id;

      await createRoleAssignmentViaApi({
        membershipId,
        roleId,
      });

      const response = await authorizedInject({
        method: 'DELETE',
        url: `/api/role-assignments/${membershipId}/${roleId}`,
      });

      assert.equal(response.statusCode, 200);

      const body = response.body as { status?: string };

      assert.equal(body.status, 'REMOVED');
    });

    it('returns 200 for idempotent remove on an already removed assignment', async () => {
      const boundTenantId = await authorizeRole([
        'ROLE_ASSIGN',
        'ROLE_CREATE',
        'ROLE_REMOVE',
      ]);
      const membershipId = await findMembershipId(
        authenticatedPersonId,
        boundTenantId,
      );
      const createdRole = await createRoleViaApi({ tenantId: boundTenantId });

      assert.equal(createdRole.statusCode, 201);

      const roleId = (createdRole.body as { id: string }).id;

      await createRoleAssignmentViaApi({
        membershipId,
        roleId,
      });

      const first = await authorizedInject({
        method: 'DELETE',
        url: `/api/role-assignments/${membershipId}/${roleId}`,
      });

      assert.equal(first.statusCode, 200);

      const second = await authorizedInject({
        method: 'DELETE',
        url: `/api/role-assignments/${membershipId}/${roleId}`,
      });

      assert.equal(second.statusCode, 200);

      const body = second.body as { status?: string };

      assert.equal(body.status, 'REMOVED');
    });

    it('returns 403 for DELETE on a foreign tenant scope', async () => {
      const boundTenantId = await authorizeRole(['ROLE_REMOVE']);
      const foreign = await seedForeignRoleAssignment();

      assert.notEqual(foreign.tenantId, boundTenantId);

      const response = await authorizedInject({
        method: 'DELETE',
        url: `/api/role-assignments/${foreign.membershipId}/${foreign.roleId}`,
      });

      assert.equal(response.statusCode, 403);
      assertForbidden(response.body);
    });

    it('returns 404 for missing role assignment in the bound tenant', async () => {
      const boundTenantId = await authorizeRole(['ROLE_REMOVE', 'ROLE_CREATE']);
      const membershipId = await findMembershipId(
        authenticatedPersonId,
        boundTenantId,
      );
      const createdRole = await createRoleViaApi({ tenantId: boundTenantId });

      assert.equal(createdRole.statusCode, 201);

      const response = await authorizedInject({
        method: 'DELETE',
        url: `/api/role-assignments/${membershipId}/${(createdRole.body as { id: string }).id}`,
      });

      assert.equal(response.statusCode, 404);
    });

    it('returns 401 without bearer token', async () => {
      const response = await injectJson(app, {
        method: 'DELETE',
        url: `/api/role-assignments/${UNKNOWN_ROLE_ASSIGNMENT_ID}/${UNKNOWN_ROLE_ID}`,
      });

      assert.equal(response.statusCode, 401);
    });

    it('returns 403 without ROLE_REMOVE', async () => {
      const boundTenantId = await authorizeRole(['ROLE_ASSIGN', 'ROLE_CREATE']);
      const membershipId = await findMembershipId(
        authenticatedPersonId,
        boundTenantId,
      );
      const createdRole = await createRoleViaApi({ tenantId: boundTenantId });

      assert.equal(createdRole.statusCode, 201);

      const roleId = (createdRole.body as { id: string }).id;

      await createRoleAssignmentViaApi({
        membershipId,
        roleId,
      });

      const response = await authorizedInject({
        method: 'DELETE',
        url: `/api/role-assignments/${membershipId}/${roleId}`,
      });

      assert.equal(response.statusCode, 403);
      assertForbidden(response.body);
    });
  });

  describe('Authorization scope prevents handler execution', () => {
    it('does not run GET handler when role scope resolution fails', async () => {
      await authorizeRole(['ROLE_READ']);

      const response = await authorizedInject({
        method: 'GET',
        url: `/api/roles/${UNKNOWN_ROLE_ID}`,
      });

      assert.equal(response.statusCode, 403);
      assertForbidden(response.body);
      assert.notEqual(
        (response.body as { statusCode?: number }).statusCode,
        404,
      );
    });

    it('does not run POST handler when tenant scope mismatches', async () => {
      const boundTenantId = await authorizeRole(['ROLE_CREATE']);
      const foreignTenantId = await seedTenantOnly(`scope-${Date.now()}`);
      const prisma = getPrismaClient();
      const beforeCount = await prisma.role.count({
        where: { tenantId: foreignTenantId },
      });

      const response = await createRoleViaApi({
        tenantId: foreignTenantId,
        name: 'Scoped Foreign Role',
      });

      assert.equal(response.statusCode, 403);
      assertForbidden(response.body);
      assert.notEqual(foreignTenantId, boundTenantId);

      const afterCount = await prisma.role.count({
        where: { tenantId: foreignTenantId },
      });

      assert.equal(afterCount, beforeCount);
    });

    it('does not run POST assignment handler when scope refs mismatch', async () => {
      const boundTenantId = await authorizeRole(['ROLE_ASSIGN']);
      const membershipId = await findMembershipId(
        authenticatedPersonId,
        boundTenantId,
      );
      const foreign = await seedForeignRole();
      const prisma = getPrismaClient();
      const beforeCount = await prisma.roleAssignment.count({
        where: {
          membershipId,
          roleId: foreign.roleId,
        },
      });

      const response = await createRoleAssignmentViaApi({
        membershipId,
        roleId: foreign.roleId,
      });

      assert.equal(response.statusCode, 403);
      assertForbidden(response.body);

      const afterCount = await prisma.roleAssignment.count({
        where: {
          membershipId,
          roleId: foreign.roleId,
        },
      });

      assert.equal(afterCount, beforeCount);
    });
  });
});

describe('Role HTTP OpenAPI (integration)', () => {
  it('documents role endpoints with security and response codes', async () => {
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

      const rolePost = spec.paths?.['/api/roles']?.post;
      const roleGet = spec.paths?.['/api/roles/{id}']?.get;
      const assignmentPost = spec.paths?.['/api/role-assignments']?.post;
      const assignmentGet = spec.paths?.['/api/role-assignments/{id}']?.get;
      const assignmentDelete =
        spec.paths?.['/api/role-assignments/{membershipId}/{roleId}']?.delete;

      assert.ok(rolePost);
      assert.ok(roleGet);
      assert.ok(assignmentPost);
      assert.ok(assignmentGet);
      assert.ok(assignmentDelete);

      assert.ok('201' in (rolePost?.responses ?? {}));
      assert.ok('409' in (rolePost?.responses ?? {}));
      assert.ok('403' in (rolePost?.responses ?? {}));
      assert.ok('401' in (rolePost?.responses ?? {}));

      assert.ok('200' in (roleGet?.responses ?? {}));
      assert.ok('403' in (roleGet?.responses ?? {}));
      assert.ok('401' in (roleGet?.responses ?? {}));
      assert.equal('404' in (roleGet?.responses ?? {}), false);

      assert.ok('201' in (assignmentPost?.responses ?? {}));
      assert.ok('200' in (assignmentPost?.responses ?? {}));
      assert.ok('409' in (assignmentPost?.responses ?? {}));
      assert.ok('403' in (assignmentPost?.responses ?? {}));
      assert.ok('401' in (assignmentPost?.responses ?? {}));

      assert.ok('200' in (assignmentGet?.responses ?? {}));
      assert.ok('403' in (assignmentGet?.responses ?? {}));
      assert.ok('401' in (assignmentGet?.responses ?? {}));
      assert.equal('404' in (assignmentGet?.responses ?? {}), false);

      assert.ok('200' in (assignmentDelete?.responses ?? {}));
      assert.ok('404' in (assignmentDelete?.responses ?? {}));
      assert.ok('403' in (assignmentDelete?.responses ?? {}));
      assert.ok('401' in (assignmentDelete?.responses ?? {}));

      assert.deepEqual(rolePost?.security, [{ bearerAuth: [] }]);
      assert.deepEqual(roleGet?.security, [{ bearerAuth: [] }]);
      assert.deepEqual(assignmentPost?.security, [{ bearerAuth: [] }]);
      assert.deepEqual(assignmentGet?.security, [{ bearerAuth: [] }]);
      assert.deepEqual(assignmentDelete?.security, [{ bearerAuth: [] }]);
    }
    finally {
      await app.close();
    }
  });
});
