import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { FixedClock } from '../../../../test-support/fixed-clock.js';
import { noopEventDispatcher } from '../../../../test-support/noop-event-dispatcher.js';
import { Prescription } from '../../domain/aggregates/prescription.aggregate.js';
import { PrescriptionLine } from '../../domain/entities/prescription-line.js';
import { PrescriptionId } from '../../domain/value-objects/prescription-id.js';
import { PrescriptionStatusValue } from '../../domain/value-objects/prescription-status.js';
import { PrescriptionTitle } from '../../domain/value-objects/prescription-title.js';
import { Dose } from '../../domain/value-objects/dose.js';
import { Frequency } from '../../domain/value-objects/frequency.js';
import { PrescriptionLineDescription } from '../../domain/value-objects/prescription-line-description.js';
import { DoseUnitValue } from '../../domain/value-objects/dose-unit.js';
import { PrescriptionClinicalNotes } from '../../domain/value-objects/prescription-text-sections.js';
import { PatientInstructions } from '../../domain/value-objects/prescription-text-sections.js';
import { InMemoryPrescriptionRepository } from '../../infrastructure/repositories/in-memory-prescription.repository.js';
import { PrescriptionCancellationReasonRequiredError } from '../errors/prescription-cancellation-reason-required.error.js';
import { CancelPrescriptionCommand } from './cancel-prescription.command.js';
import { CancelPrescriptionHandler } from './cancel-prescription.handler.js';

const NOW = new Date('2026-07-20T10:00:00.000Z');
const LATER = new Date('2026-07-20T11:00:00.000Z');
const TENANT_ID = '550e8400-e29b-41d4-a716-446655440001';
const PATIENT_ID = '550e8400-e29b-41d4-a716-446655440020';
const CREATED_BY_ID = '550e8400-e29b-41d4-a716-446655440030';
const RESPONSIBLE_ID = '550e8400-e29b-41d4-a716-446655440031';
const PRESCRIPTION_ID = '550e8400-e29b-41d4-a716-446655440090';

async function seedIssuedPrescription(repository: InMemoryPrescriptionRepository) {
  const prescription = Prescription.reconstitute({
    id: PrescriptionId.create(PRESCRIPTION_ID),
    tenantId: TENANT_ID,
    patientId: PATIENT_ID,
    createdByNutritionistId: CREATED_BY_ID,
    responsibleNutritionistId: RESPONSIBLE_ID,
    originClinicalEncounterId: null,
    originAnamnesisId: null,
    status: PrescriptionStatusValue.Issued,
    version: 2,
    title: PrescriptionTitle.create('Issued prescription'),
    clinicalNotes: PrescriptionClinicalNotes.empty(),
    patientInstructions: PatientInstructions.empty(),
    cancellationReason: null,
    issuedAt: NOW,
    cancelledAt: null,
    lines: [
      PrescriptionLine.create({
        sortOrder: 1,
        description: PrescriptionLineDescription.create('Vitamin D3'),
        dose: Dose.create({ quantity: '2000', unit: DoseUnitValue.Iu }),
        frequency: Frequency.create({ displayText: 'Once daily' }),
      }),
    ],
    createdAt: NOW,
    updatedAt: NOW,
  });
  await repository.save(prescription);
}

describe('CancelPrescriptionHandler', () => {
  it('cancels draft prescription without cancellation reason', async () => {
    const repository = new InMemoryPrescriptionRepository();
    const draft = Prescription.create({
      id: PrescriptionId.create(PRESCRIPTION_ID),
      tenantId: TENANT_ID,
      patientId: PATIENT_ID,
      createdByNutritionistId: CREATED_BY_ID,
      responsibleNutritionistId: RESPONSIBLE_ID,
      now: NOW,
    });
    draft.clearDomainEvents();
    await repository.save(draft);

    const handler = new CancelPrescriptionHandler(
      repository,
      new FixedClock(LATER),
      noopEventDispatcher,
    );

    const result = await handler.execute(
      new CancelPrescriptionCommand({
        tenantId: TENANT_ID,
        prescriptionId: PRESCRIPTION_ID,
      }),
    );

    assert.equal(result.status, PrescriptionStatusValue.Cancelled);
    assert.equal(result.cancellationReason, null);
  });

  it('cancels issued prescription when cancellation reason is provided', async () => {
    const repository = new InMemoryPrescriptionRepository();
    await seedIssuedPrescription(repository);
    const handler = new CancelPrescriptionHandler(
      repository,
      new FixedClock(LATER),
      noopEventDispatcher,
    );

    const result = await handler.execute(
      new CancelPrescriptionCommand({
        tenantId: TENANT_ID,
        prescriptionId: PRESCRIPTION_ID,
        cancellationReason: 'Administrative correction',
      }),
    );

    assert.equal(result.status, PrescriptionStatusValue.Cancelled);
    assert.equal(result.cancellationReason, 'Administrative correction');
  });

  it('throws when cancelling issued prescription without reason', async () => {
    const repository = new InMemoryPrescriptionRepository();
    await seedIssuedPrescription(repository);
    const handler = new CancelPrescriptionHandler(
      repository,
      new FixedClock(LATER),
      noopEventDispatcher,
    );

    await assert.rejects(
      () =>
        handler.execute(
          new CancelPrescriptionCommand({
            tenantId: TENANT_ID,
            prescriptionId: PRESCRIPTION_ID,
          }),
        ),
      PrescriptionCancellationReasonRequiredError,
    );
  });
});
