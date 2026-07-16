import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { PatientNutritionistAssignmentRoleValue } from '../../domain/value-objects/patient-nutritionist-assignment-role.js';
import { PatientNutritionistAssignmentStatus } from '../../domain/value-objects/patient-nutritionist-assignment-status.js';
import { PatientNutritionistAssignment } from '../../domain/aggregates/patient-nutritionist-assignment.aggregate.js';
import { PatientNutritionistAssignmentRole } from '../../domain/value-objects/patient-nutritionist-assignment-role.js';
import { PatientId } from '../../domain/value-objects/patient-id.js';
import { TenantId } from '../../../iam/domain/value-objects/tenant-id.js';
import { CapturingEventDispatcher } from '../../../../test-support/capturing-event-dispatcher.js';
import { noopEventDispatcher } from '../../../../test-support/noop-event-dispatcher.js';
import { InMemoryPatientNutritionistAssignmentRepository } from '../../infrastructure/repositories/in-memory-patient-nutritionist-assignment.repository.js';
import { PatientNutritionistAssignmentNotFoundError } from '../errors/patient-nutritionist-assignment-not-found.error.js';
import { RemoveNutritionistFromPatientCommand } from './remove-nutritionist-from-patient.command.js';
import { RemoveNutritionistFromPatientHandler } from './remove-nutritionist-from-patient.handler.js';

const TENANT_ID = '550e8400-e29b-41d4-a716-446655440050';
const PATIENT_ID = '550e8400-e29b-41d4-a716-446655440051';
const NUTRITIONIST_ID = '550e8400-e29b-41d4-a716-446655440052';

describe('RemoveNutritionistFromPatientHandler', () => {
  it('removes an active assignment', async () => {
    const repository = new InMemoryPatientNutritionistAssignmentRepository();
    const assignment = PatientNutritionistAssignment.create({
      tenantId: TenantId.create(TENANT_ID),
      patientId: PatientId.create(PATIENT_ID),
      nutritionistId: NUTRITIONIST_ID,
      role: PatientNutritionistAssignmentRole.primary(),
    });
    assignment.clearDomainEvents();
    await repository.save(assignment);

    const eventDispatcher = new CapturingEventDispatcher();
    const handler = new RemoveNutritionistFromPatientHandler(
      repository,
      eventDispatcher,
    );

    const result = await handler.execute(
      new RemoveNutritionistFromPatientCommand({
        tenantId: TENANT_ID,
        patientId: PATIENT_ID,
        nutritionistId: NUTRITIONIST_ID,
      }),
    );

    assert.equal(result.status, PatientNutritionistAssignmentStatus.Removed);
    assert.ok(result.removedAt);
    assert.equal(
      (eventDispatcher.dispatched[0]?.[0] as { eventName: string }).eventName,
      'PatientNutritionistRemoved',
    );
  });

  it('is idempotent when assignment is already removed', async () => {
    const repository = new InMemoryPatientNutritionistAssignmentRepository();
    const assignment = PatientNutritionistAssignment.create({
      tenantId: TenantId.create(TENANT_ID),
      patientId: PatientId.create(PATIENT_ID),
      nutritionistId: NUTRITIONIST_ID,
      role: PatientNutritionistAssignmentRole.supporting(),
    });
    assignment.remove();
    assignment.clearDomainEvents();
    await repository.save(assignment);

    const eventDispatcher = new CapturingEventDispatcher();
    const handler = new RemoveNutritionistFromPatientHandler(
      repository,
      eventDispatcher,
    );

    const result = await handler.execute(
      new RemoveNutritionistFromPatientCommand({
        tenantId: TENANT_ID,
        patientId: PATIENT_ID,
        nutritionistId: NUTRITIONIST_ID,
      }),
    );

    assert.equal(result.status, PatientNutritionistAssignmentStatus.Removed);
    assert.equal(eventDispatcher.dispatched.length, 0);
  });

  it('throws when assignment is not found', async () => {
    const handler = new RemoveNutritionistFromPatientHandler(
      new InMemoryPatientNutritionistAssignmentRepository(),
      noopEventDispatcher,
    );

    await assert.rejects(
      () =>
        handler.execute(
          new RemoveNutritionistFromPatientCommand({
            tenantId: TENANT_ID,
            patientId: PATIENT_ID,
            nutritionistId: NUTRITIONIST_ID,
          }),
        ),
      PatientNutritionistAssignmentNotFoundError,
    );
  });

  it('throws tenant mismatch when assignment belongs to another tenant', async () => {
    const repository = new InMemoryPatientNutritionistAssignmentRepository();
    const assignment = PatientNutritionistAssignment.create({
      tenantId: TenantId.create('550e8400-e29b-41d4-a716-446655440099'),
      patientId: PatientId.create(PATIENT_ID),
      nutritionistId: NUTRITIONIST_ID,
      role: PatientNutritionistAssignmentRole.supporting(),
    });
    await repository.save(assignment);

    const handler = new RemoveNutritionistFromPatientHandler(
      repository,
      noopEventDispatcher,
    );

    await assert.rejects(
      () =>
        handler.execute(
          new RemoveNutritionistFromPatientCommand({
            tenantId: TENANT_ID,
            patientId: PATIENT_ID,
            nutritionistId: NUTRITIONIST_ID,
          }),
        ),
      PatientNutritionistAssignmentNotFoundError,
    );
  });
});
