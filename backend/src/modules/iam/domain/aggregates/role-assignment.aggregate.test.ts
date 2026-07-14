import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  RoleAssigned,
  RoleRemoved,
} from '../events/role-assignment-events.js';
import { MembershipId } from '../value-objects/membership-id.js';
import { RoleAssignmentId } from '../value-objects/role-assignment-id.js';
import { RoleAssignmentStatus } from '../value-objects/role-assignment-status.js';
import { RoleId } from '../value-objects/role-id.js';
import { RoleAssignment } from './role-assignment.aggregate.js';

const ASSIGNMENT_ID = RoleAssignmentId.create(
  '550e8400-e29b-41d4-a716-446655440030',
);
const MEMBERSHIP_ID = MembershipId.create('550e8400-e29b-41d4-a716-446655440011');
const ROLE_ID = RoleId.create('550e8400-e29b-41d4-a716-446655440020');
const TENANT_ID = '550e8400-e29b-41d4-a716-446655440012';

describe('RoleAssignment aggregate', () => {
  it('creates an active assignment without storing tenantId', () => {
    const assignment = RoleAssignment.create(
      {
        id: ASSIGNMENT_ID,
        membershipId: MEMBERSHIP_ID,
        roleId: ROLE_ID,
      },
      TENANT_ID,
    );

    assert.equal(assignment.getMembershipId().toString(), MEMBERSHIP_ID.toString());
    assert.equal(assignment.getRoleId().toString(), ROLE_ID.toString());
    assert.equal(assignment.getStatus(), RoleAssignmentStatus.Active);
  });

  it('publishes RoleAssigned with explicit event payload', () => {
    const assignment = RoleAssignment.create(
      {
        id: ASSIGNMENT_ID,
        membershipId: MEMBERSHIP_ID,
        roleId: ROLE_ID,
      },
      TENANT_ID,
    );
    const event = assignment.domainEvents[0] as RoleAssigned;

    assert.ok(event instanceof RoleAssigned);
    assert.equal(event.aggregateId, ASSIGNMENT_ID.toString());
    assert.equal(event.membershipId, MEMBERSHIP_ID.toString());
    assert.equal(event.roleId, ROLE_ID.toString());
    assert.equal(event.tenantId, TENANT_ID);
  });

  it('reactivates a removed assignment reusing the same row', () => {
    const assignment = RoleAssignment.create(
      { id: ASSIGNMENT_ID, membershipId: MEMBERSHIP_ID, roleId: ROLE_ID },
      TENANT_ID,
    );
    assignment.remove(TENANT_ID);
    assignment.clearDomainEvents();

    assignment.reactivate(TENANT_ID);

    assert.equal(assignment.getStatus(), RoleAssignmentStatus.Active);
    assert.equal(assignment.getRemovedAt(), null);
    assert.ok(assignment.getReactivatedAt() instanceof Date);
    assert.ok(assignment.domainEvents[0] instanceof RoleAssigned);
  });

  it('remove is idempotent', () => {
    const assignment = RoleAssignment.create(
      { id: ASSIGNMENT_ID, membershipId: MEMBERSHIP_ID, roleId: ROLE_ID },
      TENANT_ID,
    );
    assignment.remove(TENANT_ID);
    assignment.clearDomainEvents();

    assignment.remove(TENANT_ID);

    assert.equal(assignment.domainEvents.length, 0);
    assert.ok(assignment.domainEvents[0] === undefined);
  });

  it('publishes RoleRemoved with explicit payload', () => {
    const assignment = RoleAssignment.create(
      { id: ASSIGNMENT_ID, membershipId: MEMBERSHIP_ID, roleId: ROLE_ID },
      TENANT_ID,
    );
    assignment.clearDomainEvents();
    assignment.remove(TENANT_ID);
    const event = assignment.domainEvents[0] as RoleRemoved;

    assert.ok(event instanceof RoleRemoved);
    assert.equal(event.tenantId, TENANT_ID);
    assert.equal(event.membershipId, MEMBERSHIP_ID.toString());
    assert.equal(event.roleId, ROLE_ID.toString());
  });
});
