import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { FixedClock } from '../../../../test-support/fixed-clock.js';
import { noopEventDispatcher } from '../../../../test-support/noop-event-dispatcher.js';
import { Prescription } from '../../domain/aggregates/prescription.aggregate.js';
import { PrescriptionId } from '../../domain/value-objects/prescription-id.js';
import { InMemoryPrescriptionRepository } from '../../infrastructure/repositories/in-memory-prescription.repository.js';
import { EditPrescriptionCommand } from './edit-prescription.command.js';
import { EditPrescriptionHandler } from './edit-prescription.handler.js';

const NOW = new Date('2026-07-20T10:00:00.000Z');
const LATER = new Date('2026-07-20T11:00:00.000Z');
const TENANT_ID = '550e8400-e29b-41d4-a716-446655440001';
const PATIENT_ID = '550e8400-e29b-41d4-a716-446655440020';
const CREATED_BY_ID = '550e8400-e29b-41d4-a716-446655440030';
const RESPONSIBLE_ID = '550e8400-e29b-41d4-a716-446655440031';
const PRESCRIPTION_ID = '550e8400-e29b-41d4-a716-446655440090';

describe('EditPrescriptionHandler', () => {
  it('edits draft prescription fields', async () => {
    const repository = new InMemoryPrescriptionRepository();
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

    const handler = new EditPrescriptionHandler(
      repository,
      new FixedClock(LATER),
      noopEventDispatcher,
    );

    const result = await handler.execute(
      new EditPrescriptionCommand({
        tenantId: TENANT_ID,
        prescriptionId: PRESCRIPTION_ID,
        title: 'Updated supplementation protocol',
        clinicalNotes: 'Revised monitoring plan.',
        lines: [
          {
            sortOrder: 1,
            description: 'Omega-3',
            doseQuantity: '1000',
            doseUnit: 'MG',
            frequencyDisplayText: 'Twice daily with meals',
          },
        ],
      }),
    );

    assert.equal(result.title, 'Updated supplementation protocol');
    assert.equal(result.clinicalNotes, 'Revised monitoring plan.');
    assert.equal(result.lines.length, 1);
    assert.equal(result.lines[0]?.description, 'Omega-3');
    assert.equal(result.version, 2);
  });
});
