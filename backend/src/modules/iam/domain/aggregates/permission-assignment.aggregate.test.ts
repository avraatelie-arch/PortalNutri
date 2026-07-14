import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  PermissionGranted,
  PermissionRevoked,
} from '../events/permission-assignment-events.js';
import { PermissionAssignmentId } from '../value-objects/permission-assignment-id.js';
import { PermissionAssignmentStatus } from '../value-objects/permission-assignment-status.js';
import { PermissionId } from '../value-objects/permission-id.js';
import { RoleId } from '../value-objects/role-id.js';
import { PermissionAssignment } from './permission-assignment.aggregate.js';

const ASSIGNMENT_ID = PermissionAssignmentId.create(
  '550e8400-e29b-41d4-a716-446655440050',
);
const ROLE_ID = RoleId.create('550e8400-e29b-41d4-a716-446655440020');
const PERMISSION_ID = PermissionId.create('550e8400-e29b-41d4-a716-446655440040');
const TENANT_ID = '550e8400-e29b-41d4-a716-446655440012';

describe('PermissionAssignment aggregate', () => {
  it('creates an active assignment without storing tenantId', () => {
    const assignment = PermissionAssignment.create(
      {
        id: ASSIGNMENT_ID,
        roleId: ROLE_ID,
        permissionId: PERMISSION_ID,
      },
      TENANT_ID,
    );

    assert.equal(assignment.getRoleId().toString(), ROLE_ID.toString());
    assert.equal(assignment.getPermissionId().toString(), PERMISSION_ID.toString());
    assert.equal(assignment.getStatus(), PermissionAssignmentStatus.Active);
  });

  it('publishes PermissionGranted with explicit event payload', () => {
    const assignment = PermissionAssignment.create(
      {
        id: ASSIGNMENT_ID,
        roleId: ROLE_ID,
        permissionId: PERMISSION_ID,
      },
      TENANT_ID,
    );
    const event = assignment.domainEvents[0] as PermissionGranted;

    assert.ok(event instanceof PermissionGranted);
    assert.equal(event.aggregateId, ASSIGNMENT_ID.toString());
    assert.equal(event.roleId, ROLE_ID.toString());
    assert.equal(event.permissionId, PERMISSION_ID.toString());
    assert.equal(event.tenantId, TENANT_ID);
  });

  it('reactivates a removed assignment reusing the same row', () => {
    const assignment = PermissionAssignment.create(
      { id: ASSIGNMENT_ID, roleId: ROLE_ID, permissionId: PERMISSION_ID },
      TENANT_ID,
    );
    assignment.remove(TENANT_ID);
    assignment.clearDomainEvents();

    assignment.reactivate(TENANT_ID);

    assert.equal(assignment.getStatus(), PermissionAssignmentStatus.Active);
    assert.equal(assignment.getRemovedAt(), null);
    assert.ok(assignment.getReactivatedAt() instanceof Date);
    assert.ok(assignment.domainEvents[0] instanceof PermissionGranted);
  });

  it('remove is idempotent', () => {
    const assignment = PermissionAssignment.create(
      { id: ASSIGNMENT_ID, roleId: ROLE_ID, permissionId: PERMISSION_ID },
      TENANT_ID,
    );
    assignment.remove(TENANT_ID);
    assignment.clearDomainEvents();

    assignment.remove(TENANT_ID);

    assert.equal(assignment.domainEvents.length, 0);
    assert.ok(assignment.domainEvents[0] === undefined);
  });

  it('publishes PermissionRevoked with explicit payload', () => {
    const assignment = PermissionAssignment.create(
      { id: ASSIGNMENT_ID, roleId: ROLE_ID, permissionId: PERMISSION_ID },
      TENANT_ID,
    );
    assignment.clearDomainEvents();
    assignment.remove(TENANT_ID);
    const event = assignment.domainEvents[0] as PermissionRevoked;

    assert.ok(event instanceof PermissionRevoked);
    assert.equal(event.tenantId, TENANT_ID);
    assert.equal(event.roleId, ROLE_ID.toString());
    assert.equal(event.permissionId, PERMISSION_ID.toString());
  });
});
