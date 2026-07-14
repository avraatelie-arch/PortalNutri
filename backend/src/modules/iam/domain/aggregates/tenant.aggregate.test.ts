import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  TenantActivated,
  TenantCreated,
  TenantDeactivated,
} from '../events/tenant-events.js';
import { TenantId } from '../value-objects/tenant-id.js';
import { TenantName } from '../value-objects/tenant-name.js';
import { TenantSlug } from '../value-objects/tenant-slug.js';
import { TenantStatus } from '../value-objects/tenant-status.js';
import { Tenant } from './tenant.aggregate.js';

const TENANT_ID = TenantId.create('550e8400-e29b-41d4-a716-446655440001');

function createValidTenantProps() {
  return {
    id: TENANT_ID,
    name: TenantName.create('Portal Nutri Clinic'),
    slug: TenantSlug.create('portal-nutri-clinic'),
  };
}

describe('Tenant aggregate', () => {
  it('creates a valid tenant', () => {
    const tenant = Tenant.create(createValidTenantProps());

    assert.equal(tenant.getId().toString(), TENANT_ID.toString());
    assert.equal(tenant.getName().toString(), 'Portal Nutri Clinic');
    assert.equal(tenant.getSlug().toString(), 'portal-nutri-clinic');
  });

  it('starts with Active status', () => {
    const tenant = Tenant.create(createValidTenantProps());

    assert.equal(tenant.getStatus(), TenantStatus.Active);
    assert.equal(tenant.isActive(), true);
  });

  it('publishes TenantCreated on creation', () => {
    const tenant = Tenant.create(createValidTenantProps());
    const event = tenant.domainEvents[0] as TenantCreated;

    assert.equal(tenant.domainEvents.length, 1);
    assert.ok(event instanceof TenantCreated);
    assert.equal(event.eventName, 'TenantCreated');
    assert.equal(event.aggregateId, TENANT_ID.toString());
    assert.equal(event.name, 'Portal Nutri Clinic');
    assert.equal(event.slug, 'portal-nutri-clinic');
  });

  it('deactivates an active tenant', () => {
    const tenant = Tenant.create(createValidTenantProps());
    tenant.clearDomainEvents();

    tenant.deactivate();

    assert.equal(tenant.getStatus(), TenantStatus.Inactive);
    assert.equal(tenant.isActive(), false);
    assert.ok(tenant.domainEvents[0] instanceof TenantDeactivated);
  });

  it('activates an inactive tenant', () => {
    const tenant = Tenant.create(createValidTenantProps());
    tenant.deactivate();
    tenant.clearDomainEvents();

    tenant.activate();

    assert.equal(tenant.getStatus(), TenantStatus.Active);
    assert.ok(tenant.domainEvents[0] instanceof TenantActivated);
  });

  it('deactivate is idempotent', () => {
    const tenant = Tenant.create(createValidTenantProps());
    tenant.deactivate();
    tenant.clearDomainEvents();

    tenant.deactivate();

    assert.equal(tenant.domainEvents.length, 0);
    assert.equal(tenant.getStatus(), TenantStatus.Inactive);
  });

  it('activate is idempotent', () => {
    const tenant = Tenant.create(createValidTenantProps());
    tenant.clearDomainEvents();

    tenant.activate();

    assert.equal(tenant.domainEvents.length, 0);
    assert.equal(tenant.getStatus(), TenantStatus.Active);
  });
});

describe('TenantName', () => {
  it('trims external whitespace', () => {
    assert.equal(TenantName.create('  Clinic Name  ').toString(), 'Clinic Name');
  });

  it('rejects empty values', () => {
    assert.throws(() => TenantName.create('   '), /TenantName is required/);
  });
});

describe('TenantSlug', () => {
  it('normalizes to lowercase and trims whitespace', () => {
    assert.equal(
      TenantSlug.create('  Portal-Nutri-Clinic  ').toString(),
      'portal-nutri-clinic',
    );
  });

  it('rejects leading or trailing hyphens', () => {
    assert.throws(() => TenantSlug.create('-invalid'), /TenantSlug must contain/);
    assert.throws(() => TenantSlug.create('invalid-'), /TenantSlug must contain/);
  });

  it('rejects repeated consecutive hyphens', () => {
    assert.throws(() => TenantSlug.create('invalid--slug'), /TenantSlug must contain/);
  });

  it('rejects invalid characters', () => {
    assert.throws(() => TenantSlug.create('invalid_slug'), /TenantSlug must contain/);
  });
});
