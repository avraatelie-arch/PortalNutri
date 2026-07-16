import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  PatientNutritionistAssigned,
  PatientNutritionistReactivated,
  PatientNutritionistRemoved,
} from '../events/patient-nutritionist-assignment-events.js';
import { PatientNutritionistAssignmentId } from '../value-objects/patient-nutritionist-assignment-id.js';
import { PatientNutritionistAssignmentRole } from '../value-objects/patient-nutritionist-assignment-role.js';
import { PatientNutritionistAssignmentStatus } from '../value-objects/patient-nutritionist-assignment-status.js';
import { PatientId } from '../value-objects/patient-id.js';
import { TenantId } from '../../../iam/domain/value-objects/tenant-id.js';
import { PatientNutritionistAssignment } from './patient-nutritionist-assignment.aggregate.js';

const ASSIGNMENT_ID = PatientNutritionistAssignmentId.create(
  '550e8400-e29b-41d4-a716-446655440020',
);
const PATIENT_ID = PatientId.create('550e8400-e29b-41d4-a716-446655440021');
const TENANT_ID = TenantId.create('550e8400-e29b-41d4-a716-446655440022');
const NUTRITIONIST_ID = '550e8400-e29b-41d4-a716-446655440023';

function createPrimaryAssignment() {
  return PatientNutritionistAssignment.create({
    id: ASSIGNMENT_ID,
    tenantId: TENANT_ID,
    patientId: PATIENT_ID,
    nutritionistId: NUTRITIONIST_ID,
    role: PatientNutritionistAssignmentRole.primary(),
  });
}

describe('PatientNutritionistAssignment aggregate', () => {
  it('creates a PRIMARY assignment', () => {
    const assignment = createPrimaryAssignment();

    assert.equal(assignment.getRole().toString(), 'PRIMARY');
    assert.equal(assignment.getStatus(), PatientNutritionistAssignmentStatus.Active);
  });

  it('creates a SUPPORTING assignment', () => {
    const assignment = PatientNutritionistAssignment.create({
      tenantId: TENANT_ID,
      patientId: PATIENT_ID,
      nutritionistId: NUTRITIONIST_ID,
      role: PatientNutritionistAssignmentRole.supporting(),
    });

    assert.equal(assignment.getRole().toString(), 'SUPPORTING');
  });

  it('publishes PatientNutritionistAssigned with explicit payload', () => {
    const assignment = createPrimaryAssignment();
    const event = assignment.domainEvents[0] as PatientNutritionistAssigned;

    assert.ok(event instanceof PatientNutritionistAssigned);
    assert.equal(event.aggregateId, ASSIGNMENT_ID.toString());
    assert.equal(event.tenantId, TENANT_ID.toString());
    assert.equal(event.patientId, PATIENT_ID.toString());
    assert.equal(event.nutritionistId, NUTRITIONIST_ID);
    assert.equal(event.role, 'PRIMARY');
    assert.ok(event.occurredAt instanceof Date);
  });

  it('removes an active assignment', () => {
    const assignment = createPrimaryAssignment();
    assignment.clearDomainEvents();

    assignment.remove();

    assert.equal(assignment.getStatus(), PatientNutritionistAssignmentStatus.Removed);
    assert.ok(assignment.getRemovedAt() instanceof Date);
    const event = assignment.domainEvents[0] as PatientNutritionistRemoved;
    assert.equal(event.aggregateId, ASSIGNMENT_ID.toString());
    assert.equal(event.tenantId, TENANT_ID.toString());
    assert.equal(event.patientId, PATIENT_ID.toString());
    assert.equal(event.nutritionistId, NUTRITIONIST_ID);
    assert.equal(event.role, 'PRIMARY');
  });

  it('remove is idempotent', () => {
    const assignment = createPrimaryAssignment();
    assignment.remove();
    assignment.clearDomainEvents();

    assignment.remove();

    assert.equal(assignment.domainEvents.length, 0);
    assert.equal(assignment.getStatus(), PatientNutritionistAssignmentStatus.Removed);
  });

  it('reactivates a removed assignment and clears removedAt', () => {
    const assignment = createPrimaryAssignment();
    assignment.remove();
    assignment.clearDomainEvents();

    assignment.reactivate();

    assert.equal(assignment.getStatus(), PatientNutritionistAssignmentStatus.Active);
    assert.equal(assignment.getRemovedAt(), null);
    assert.ok(assignment.getReactivatedAt() instanceof Date);
    const event = assignment.domainEvents[0] as PatientNutritionistReactivated;
    assert.equal(event.aggregateId, ASSIGNMENT_ID.toString());
    assert.equal(event.tenantId, TENANT_ID.toString());
    assert.equal(event.patientId, PATIENT_ID.toString());
    assert.equal(event.nutritionistId, NUTRITIONIST_ID);
    assert.equal(event.role, 'PRIMARY');
  });

  it('reactivate is idempotent when already active', () => {
    const assignment = createPrimaryAssignment();
    assignment.clearDomainEvents();

    assignment.reactivate();

    assert.equal(assignment.domainEvents.length, 0);
    assert.equal(assignment.getStatus(), PatientNutritionistAssignmentStatus.Active);
  });
});
