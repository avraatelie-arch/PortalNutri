import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { PermissionCreated } from '../events/permission-events.js';
import { PermissionId } from '../value-objects/permission-id.js';
import { PermissionName } from '../value-objects/permission-name.js';
import { TenantId } from '../value-objects/tenant-id.js';
import { Permission } from './permission.aggregate.js';

const PERMISSION_ID = PermissionId.create('550e8400-e29b-41d4-a716-446655440040');
const TENANT_ID = TenantId.create('550e8400-e29b-41d4-a716-446655440012');

describe('Permission aggregate', () => {
  it('creates a valid tenant-scoped permission', () => {
    const permission = Permission.create({
      id: PERMISSION_ID,
      tenantId: TENANT_ID,
      name: PermissionName.create('View Patients'),
    });

    assert.equal(permission.getId().toString(), PERMISSION_ID.toString());
    assert.equal(permission.getTenantId().toString(), TENANT_ID.toString());
    assert.equal(permission.getName().toString(), 'View Patients');
  });

  it('publishes PermissionCreated with explicit payload', () => {
    const permission = Permission.create({
      id: PERMISSION_ID,
      tenantId: TENANT_ID,
      name: PermissionName.create('View Patients'),
    });
    const event = permission.domainEvents[0] as PermissionCreated;

    assert.ok(event instanceof PermissionCreated);
    assert.equal(event.aggregateId, PERMISSION_ID.toString());
    assert.equal(event.tenantId, TENANT_ID.toString());
    assert.equal(event.name, 'View Patients');
    assert.ok(event.occurredAt instanceof Date);
  });
});

describe('PermissionName', () => {
  it('trims and collapses external whitespace', () => {
    assert.equal(
      PermissionName.create('  View   Patients  ').toString(),
      'View Patients',
    );
  });

  it('rejects empty values', () => {
    assert.throws(() => PermissionName.create('   '), /PermissionName is required/);
  });

  it('keeps the display value casing while normalizing internally', () => {
    const name = PermissionName.create('  View   Patients  ');

    assert.equal(name.value, 'View Patients');
    assert.equal(name.normalizedValue, 'view patients');
  });
});
