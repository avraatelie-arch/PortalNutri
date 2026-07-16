import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { PatientNutritionistAssignmentRoleValue } from '../../domain/value-objects/patient-nutritionist-assignment-role.js';
import { PatientNutritionistAssignment } from '../../domain/aggregates/patient-nutritionist-assignment.aggregate.js';
import { PatientNutritionistAssignmentRole } from '../../domain/value-objects/patient-nutritionist-assignment-role.js';
import { PatientId } from '../../domain/value-objects/patient-id.js';
import { TenantId } from '../../../iam/domain/value-objects/tenant-id.js';
import { InMemoryPatientNutritionistAssignmentRepository } from '../../infrastructure/repositories/in-memory-patient-nutritionist-assignment.repository.js';
import { PatientNutritionistAssignmentNotFoundError } from '../errors/patient-nutritionist-assignment-not-found.error.js';
import { FindPatientNutritionistAssignmentQuery } from './find-patient-nutritionist-assignment.query.js';
import { FindPatientNutritionistAssignmentHandler } from './find-patient-nutritionist-assignment.handler.js';

describe('FindPatientNutritionistAssignmentHandler', () => {
  it('returns assignment primitives by id', async () => {
    const repository = new InMemoryPatientNutritionistAssignmentRepository();
    const assignment = PatientNutritionistAssignment.create({
      tenantId: TenantId.create('550e8400-e29b-41d4-a716-446655440060'),
      patientId: PatientId.create('550e8400-e29b-41d4-a716-446655440061'),
      nutritionistId: '550e8400-e29b-41d4-a716-446655440062',
      role: PatientNutritionistAssignmentRole.primary(),
    });
    await repository.save(assignment);

    const handler = new FindPatientNutritionistAssignmentHandler(repository);
    const result = await handler.execute(
      new FindPatientNutritionistAssignmentQuery({
        assignmentId: assignment.getId().toString(),
      }),
    );

    assert.equal(result.id, assignment.getId().toString());
    assert.equal(result.role, PatientNutritionistAssignmentRoleValue.Primary);
    assert.equal(result.nutritionistId, '550e8400-e29b-41d4-a716-446655440062');
  });

  it('throws when assignment is not found', async () => {
    const handler = new FindPatientNutritionistAssignmentHandler(
      new InMemoryPatientNutritionistAssignmentRepository(),
    );

    await assert.rejects(
      () =>
        handler.execute(
          new FindPatientNutritionistAssignmentQuery({
            assignmentId: '550e8400-e29b-41d4-a716-446655440063',
          }),
        ),
      PatientNutritionistAssignmentNotFoundError,
    );
  });
});
