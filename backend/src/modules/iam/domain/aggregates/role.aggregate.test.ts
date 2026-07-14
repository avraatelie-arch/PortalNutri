import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { RoleCreated } from '../events/role-events.js';
import { RoleId } from '../value-objects/role-id.js';
import { RoleName } from '../value-objects/role-name.js';
import { TenantId } from '../value-objects/tenant-id.js';
import { Role } from './role.aggregate.js';

const ROLE_ID = RoleId.create('550e8400-e29b-41d4-a716-446655440020');
const TENANT_ID = TenantId.create('550e8400-e29b-41d4-a716-446655440012');

describe('Role aggregate', () => {
  it('creates a valid tenant-scoped role', () => {
    const role = Role.create({
      id: ROLE_ID,
      tenantId: TENANT_ID,
      name: RoleName.create('Clinic Admin'),
    });

    assert.equal(role.getId().toString(), ROLE_ID.toString());
    assert.equal(role.getTenantId().toString(), TENANT_ID.toString());
    assert.equal(role.getName().toString(), 'Clinic Admin');
  });

  it('publishes RoleCreated with explicit payload', () => {
    const role = Role.create({
      id: ROLE_ID,
      tenantId: TENANT_ID,
      name: RoleName.create('Clinic Admin'),
    });
    const event = role.domainEvents[0] as RoleCreated;

    assert.ok(event instanceof RoleCreated);
    assert.equal(event.aggregateId, ROLE_ID.toString());
    assert.equal(event.tenantId, TENANT_ID.toString());
    assert.equal(event.name, 'Clinic Admin');
    assert.ok(event.occurredAt instanceof Date);
  });
});

describe('RoleName', () => {
  it('trims and collapses external whitespace', () => {
    assert.equal(RoleName.create('  Clinic   Admin  ').toString(), 'Clinic Admin');
  });

  it('rejects empty values', () => {
    assert.throws(() => RoleName.create('   '), /RoleName is required/);
  });
});
