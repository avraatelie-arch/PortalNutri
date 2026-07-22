import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { FixedClock } from '../../../../test-support/fixed-clock.js';
import { noopEventDispatcher } from '../../../../test-support/noop-event-dispatcher.js';
import { Prescription } from '../../domain/aggregates/prescription.aggregate.js';
import { PrescriptionId } from '../../domain/value-objects/prescription-id.js';
import { InMemoryNutritionistDirectory } from '../../infrastructure/adapters/in-memory-nutritionist-directory.js';
import { InMemoryPrescriptionRepository } from '../../infrastructure/repositories/in-memory-prescription.repository.js';
import { ChangePrescriptionResponsibleNutritionistCommand } from './change-prescription-responsible-nutritionist.command.js';
import { ChangePrescriptionResponsibleNutritionistHandler } from './change-prescription-responsible-nutritionist.handler.js';

const NOW = new Date('2026-07-20T10:00:00.000Z');
const LATER = new Date('2026-07-20T11:00:00.000Z');
const TENANT_ID = '550e8400-e29b-41d4-a716-446655440001';
const PATIENT_ID = '550e8400-e29b-41d4-a716-446655440020';
const CREATED_BY_ID = '550e8400-e29b-41d4-a716-446655440030';
const RESPONSIBLE_ID = '550e8400-e29b-41d4-a716-446655440031';
const NEW_RESPONSIBLE_ID = '550e8400-e29b-41d4-a716-446655440032';
const PRESCRIPTION_ID = '550e8400-e29b-41d4-a716-446655440090';

describe('ChangePrescriptionResponsibleNutritionistHandler', () => {
  it('changes responsible nutritionist', async () => {
    const repository = new InMemoryPrescriptionRepository();
    const nutritionistDirectory = new InMemoryNutritionistDirectory();
    nutritionistDirectory.seed({ id: NEW_RESPONSIBLE_ID, tenantId: TENANT_ID, status: 'ACTIVE' });

    const prescription = Prescription.create({
      id: PrescriptionId.create(PRESCRIPTION_ID),
      tenantId: TENANT_ID,
      patientId: PATIENT_ID,
      createdByNutritionistId: CREATED_BY_ID,
      responsibleNutritionistId: RESPONSIBLE_ID,
      now: NOW,
    });
    prescription.clearDomainEvents();
    await repository.save(prescription);

    const handler = new ChangePrescriptionResponsibleNutritionistHandler(
      repository,
      nutritionistDirectory,
      new FixedClock(LATER),
      noopEventDispatcher,
    );

    const result = await handler.execute(
      new ChangePrescriptionResponsibleNutritionistCommand({
        tenantId: TENANT_ID,
        prescriptionId: PRESCRIPTION_ID,
        responsibleNutritionistId: NEW_RESPONSIBLE_ID,
      }),
    );

    assert.equal(result.responsibleNutritionistId, NEW_RESPONSIBLE_ID);
    assert.equal(result.version, 2);
  });
});
