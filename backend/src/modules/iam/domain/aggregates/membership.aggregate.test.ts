import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  MembershipCreated,
  MembershipReactivated,
  MembershipRemoved,
} from '../events/membership-events.js';
import { MembershipId } from '../value-objects/membership-id.js';
import { MembershipStatus } from '../value-objects/membership-status.js';
import { PersonId } from '../value-objects/person-id.js';
import { TenantId } from '../value-objects/tenant-id.js';
import { Membership } from './membership.aggregate.js';

const MEMBERSHIP_ID = MembershipId.create('550e8400-e29b-41d4-a716-446655440010');
const PERSON_ID = PersonId.create('550e8400-e29b-41d4-a716-446655440011');
const TENANT_ID = TenantId.create('550e8400-e29b-41d4-a716-446655440012');

function createValidMembershipProps() {
  return {
    id: MEMBERSHIP_ID,
    personId: PERSON_ID,
    tenantId: TENANT_ID,
  };
}

describe('Membership aggregate', () => {
  it('creates a valid membership', () => {
    const membership = Membership.create(createValidMembershipProps());

    assert.equal(membership.getId().toString(), MEMBERSHIP_ID.toString());
    assert.equal(membership.getPersonId().toString(), PERSON_ID.toString());
    assert.equal(membership.getTenantId().toString(), TENANT_ID.toString());
  });

  it('starts with Active status and null lifecycle timestamps', () => {
    const membership = Membership.create(createValidMembershipProps());

    assert.equal(membership.getStatus(), MembershipStatus.Active);
    assert.equal(membership.isActive(), true);
    assert.equal(membership.getReactivatedAt(), null);
    assert.equal(membership.getRemovedAt(), null);
  });

  it('publishes MembershipCreated on creation', () => {
    const membership = Membership.create(createValidMembershipProps());
    const event = membership.domainEvents[0] as MembershipCreated;

    assert.equal(membership.domainEvents.length, 1);
    assert.ok(event instanceof MembershipCreated);
    assert.equal(event.eventName, 'MembershipCreated');
    assert.equal(event.aggregateId, MEMBERSHIP_ID.toString());
    assert.equal(event.personId, PERSON_ID.toString());
    assert.equal(event.tenantId, TENANT_ID.toString());
  });

  it('removes an active membership', () => {
    const membership = Membership.create(createValidMembershipProps());
    membership.clearDomainEvents();

    membership.remove();

    assert.equal(membership.getStatus(), MembershipStatus.Removed);
    assert.equal(membership.isRemoved(), true);
    assert.ok(membership.getRemovedAt() instanceof Date);
    assert.ok(membership.domainEvents[0] instanceof MembershipRemoved);
  });

  it('reactivates a removed membership', () => {
    const membership = Membership.create(createValidMembershipProps());
    membership.remove();
    membership.clearDomainEvents();

    membership.reactivate();

    assert.equal(membership.getStatus(), MembershipStatus.Active);
    assert.equal(membership.getRemovedAt(), null);
    assert.ok(membership.getReactivatedAt() instanceof Date);
    assert.ok(membership.domainEvents[0] instanceof MembershipReactivated);
  });

  it('remove is idempotent', () => {
    const membership = Membership.create(createValidMembershipProps());
    membership.remove();
    membership.clearDomainEvents();

    membership.remove();

    assert.equal(membership.domainEvents.length, 0);
    assert.equal(membership.getStatus(), MembershipStatus.Removed);
  });

  it('reactivate is idempotent when already active', () => {
    const membership = Membership.create(createValidMembershipProps());
    membership.clearDomainEvents();

    membership.reactivate();

    assert.equal(membership.domainEvents.length, 0);
    assert.equal(membership.getStatus(), MembershipStatus.Active);
  });
});
