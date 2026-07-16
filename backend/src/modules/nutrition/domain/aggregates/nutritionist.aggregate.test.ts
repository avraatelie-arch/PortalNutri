import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { PersonId } from '../../../iam/domain/value-objects/person-id.js';
import { TenantId } from '../../../iam/domain/value-objects/tenant-id.js';
import { DomainError } from '../errors/domain-error.js';
import {
  NutritionistActivated,
  NutritionistCreated,
  NutritionistDeactivated,
  NutritionistProfileUpdated,
} from '../events/nutritionist-events.js';
import { Crn } from '../value-objects/crn.js';
import { NutritionistId } from '../value-objects/nutritionist-id.js';
import { NutritionistStatus } from '../value-objects/nutritionist-status.js';
import { Specialty } from '../value-objects/specialty.js';
import { StateCode } from '../value-objects/state-code.js';
import { Nutritionist } from './nutritionist.aggregate.js';

const NUTRITIONIST_ID = NutritionistId.create(
  '550e8400-e29b-41d4-a716-446655440010',
);
const PERSON_ID = PersonId.create('550e8400-e29b-41d4-a716-446655440000');
const TENANT_ID = TenantId.create('550e8400-e29b-41d4-a716-446655440001');

function createValidNutritionistProps() {
  return {
    id: NUTRITIONIST_ID,
    personId: PERSON_ID,
    tenantId: TENANT_ID,
    crn: Crn.create('12345'),
    stateCode: StateCode.create('SP'),
    specialty: Specialty.create('Clinical Nutrition'),
  };
}

describe('Nutritionist aggregate', () => {
  it('creates a valid nutritionist', () => {
    const nutritionist = Nutritionist.create(createValidNutritionistProps());

    assert.equal(nutritionist.getId().toString(), NUTRITIONIST_ID.toString());
    assert.equal(nutritionist.getPersonId().toString(), PERSON_ID.toString());
    assert.equal(nutritionist.getTenantId().toString(), TENANT_ID.toString());
    assert.equal(nutritionist.getCrn().toString(), '12345');
    assert.equal(nutritionist.getStateCode().toString(), 'SP');
    assert.equal(nutritionist.getSpecialty().toString(), 'Clinical Nutrition');
    assert.equal(nutritionist.getBio(), null);
  });

  it('creates a nutritionist with bio', () => {
    const nutritionist = Nutritionist.create({
      ...createValidNutritionistProps(),
      bio: '  Experienced clinical nutritionist.  ',
    });

    assert.equal(
      nutritionist.getBio(),
      'Experienced clinical nutritionist.',
    );
  });

  it('starts with Active status', () => {
    const nutritionist = Nutritionist.create(createValidNutritionistProps());

    assert.equal(nutritionist.getStatus(), NutritionistStatus.Active);
    assert.equal(nutritionist.isActive(), true);
  });

  it('publishes NutritionistCreated on creation', () => {
    const nutritionist = Nutritionist.create({
      ...createValidNutritionistProps(),
      bio: 'Focused on sports nutrition.',
    });
    const event = nutritionist.domainEvents[0] as NutritionistCreated;

    assert.equal(nutritionist.domainEvents.length, 1);
    assert.ok(event instanceof NutritionistCreated);
    assert.equal(event.eventName, 'NutritionistCreated');
    assert.equal(event.aggregateId, NUTRITIONIST_ID.toString());
    assert.equal(event.personId, PERSON_ID.toString());
    assert.equal(event.tenantId, TENANT_ID.toString());
    assert.equal(event.crn, '12345');
    assert.equal(event.stateCode, 'SP');
    assert.equal(event.specialty, 'Clinical Nutrition');
    assert.equal(event.bio, 'Focused on sports nutrition.');
  });

  it('publishes NutritionistDeactivated on deactivate', () => {
    const nutritionist = Nutritionist.create(createValidNutritionistProps());
    nutritionist.clearDomainEvents();

    nutritionist.deactivate();

    assert.equal(nutritionist.getStatus(), NutritionistStatus.Inactive);
    assert.equal(nutritionist.domainEvents.length, 1);
    assert.ok(nutritionist.domainEvents[0] instanceof NutritionistDeactivated);
    assert.equal(
      nutritionist.domainEvents[0].eventName,
      'NutritionistDeactivated',
    );
  });

  it('publishes NutritionistActivated on activate', () => {
    const nutritionist = Nutritionist.create(createValidNutritionistProps());
    nutritionist.deactivate();
    nutritionist.clearDomainEvents();

    nutritionist.activate();

    assert.equal(nutritionist.getStatus(), NutritionistStatus.Active);
    assert.equal(nutritionist.domainEvents.length, 1);
    assert.ok(nutritionist.domainEvents[0] instanceof NutritionistActivated);
    assert.equal(
      nutritionist.domainEvents[0].eventName,
      'NutritionistActivated',
    );
  });

  it('deactivate is idempotent', () => {
    const nutritionist = Nutritionist.create(createValidNutritionistProps());
    nutritionist.deactivate();
    nutritionist.clearDomainEvents();

    nutritionist.deactivate();

    assert.equal(nutritionist.domainEvents.length, 0);
    assert.equal(nutritionist.getStatus(), NutritionistStatus.Inactive);
  });

  it('activate is idempotent', () => {
    const nutritionist = Nutritionist.create(createValidNutritionistProps());
    nutritionist.clearDomainEvents();

    nutritionist.activate();

    assert.equal(nutritionist.domainEvents.length, 0);
    assert.equal(nutritionist.getStatus(), NutritionistStatus.Active);
  });

  it('publishes NutritionistProfileUpdated on profile update', () => {
    const nutritionist = Nutritionist.create(createValidNutritionistProps());
    nutritionist.clearDomainEvents();

    nutritionist.updateProfile({
      specialty: Specialty.create('Sports Nutrition'),
      bio: 'Updated bio.',
    });

    assert.equal(nutritionist.getSpecialty().toString(), 'Sports Nutrition');
    assert.equal(nutritionist.getBio(), 'Updated bio.');
    assert.equal(nutritionist.domainEvents.length, 1);
    assert.ok(
      nutritionist.domainEvents[0] instanceof NutritionistProfileUpdated,
    );
    assert.deepEqual(
      (nutritionist.domainEvents[0] as NutritionistProfileUpdated).changedFields,
      ['specialty', 'bio'],
    );
  });

  it('clears bio when set to null', () => {
    const nutritionist = Nutritionist.create({
      ...createValidNutritionistProps(),
      bio: 'Initial bio.',
    });
    nutritionist.clearDomainEvents();

    nutritionist.updateProfile({ bio: null });

    assert.equal(nutritionist.getBio(), null);
    assert.deepEqual(
      (nutritionist.domainEvents[0] as NutritionistProfileUpdated).changedFields,
      ['bio'],
    );
  });

  it('does not publish events when profile update has no changes', () => {
    const nutritionist = Nutritionist.create({
      ...createValidNutritionistProps(),
      bio: 'Same bio.',
    });
    nutritionist.clearDomainEvents();

    nutritionist.updateProfile({
      specialty: Specialty.create('Clinical Nutrition'),
      bio: 'Same bio.',
    });

    assert.equal(nutritionist.domainEvents.length, 0);
  });

  it('does not allow updating an inactive nutritionist profile', () => {
    const nutritionist = Nutritionist.create(createValidNutritionistProps());
    nutritionist.deactivate();

    assert.throws(
      () =>
        nutritionist.updateProfile({
          specialty: Specialty.create('Sports Nutrition'),
        }),
      DomainError,
    );
  });

  it('pullDomainEvents returns and clears pending events', () => {
    const nutritionist = Nutritionist.create(createValidNutritionistProps());

    const events = nutritionist.pullDomainEvents();

    assert.equal(events.length, 1);
    assert.ok(events[0] instanceof NutritionistCreated);
    assert.equal(nutritionist.domainEvents.length, 0);
  });
});

describe('Crn', () => {
  it('normalizes whitespace and uppercases value', () => {
    assert.equal(Crn.create('  crn  12345  ').toString(), 'CRN 12345');
  });

  it('rejects values shorter than 4 characters', () => {
    assert.throws(() => Crn.create('123'), /Crn must have at least 4 characters/);
  });

  it('rejects empty values', () => {
    assert.throws(() => Crn.create('   '), /Crn is required/);
  });
});

describe('StateCode', () => {
  it('accepts valid Brazilian UF codes', () => {
    assert.equal(StateCode.create('sp').toString(), 'SP');
  });

  it('rejects invalid UF codes', () => {
    assert.throws(() => StateCode.create('XX'), /valid Brazilian UF code/);
  });

  it('rejects empty values', () => {
    assert.throws(() => StateCode.create('   '), /StateCode is required/);
  });
});

describe('Specialty', () => {
  it('trims external whitespace', () => {
    assert.equal(
      Specialty.create('  Clinical Nutrition  ').toString(),
      'Clinical Nutrition',
    );
  });

  it('rejects values shorter than 2 characters', () => {
    assert.throws(
      () => Specialty.create('A'),
      /Specialty must have at least 2 characters/,
    );
  });

  it('rejects empty values', () => {
    assert.throws(() => Specialty.create('   '), /Specialty is required/);
  });
});
