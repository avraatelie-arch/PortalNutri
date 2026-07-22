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
import { InMemoryPrescriptionRepository } from '../../infrastructure/repositories/in-memory-prescription.repository.js';
import { PrescriptionNotDraftError } from '../errors/prescription-not-draft.error.js';
import { PrescriptionNotFoundError } from '../errors/prescription-not-found.error.js';
import { EmitPrescriptionCommand } from './emit-prescription.command.js';
import { EmitPrescriptionHandler } from './emit-prescription.handler.js';

const NOW = new Date('2026-07-20T10:00:00.000Z');
const LATER = new Date('2026-07-20T11:00:00.000Z');
const TENANT_ID = '550e8400-e29b-41d4-a716-446655440001';
const OTHER_TENANT_ID = '550e8400-e29b-41d4-a716-446655440099';
const PATIENT_ID = '550e8400-e29b-41d4-a716-446655440020';
const CREATED_BY_ID = '550e8400-e29b-41d4-a716-446655440030';
const RESPONSIBLE_ID = '550e8400-e29b-41d4-a716-446655440031';
const PRESCRIPTION_ID = '550e8400-e29b-41d4-a716-446655440090';

function createEmitReadyLine() {
  return PrescriptionLine.create({
    sortOrder: 1,
    description: PrescriptionLineDescription.create('Vitamin D3'),
    dose: Dose.create({ quantity: '2000', unit: DoseUnitValue.Iu }),
    frequency: Frequency.create({ displayText: 'Once daily with breakfast' }),
  });
}

async function seedDraftPrescription(repository: InMemoryPrescriptionRepository) {
  const prescription = Prescription.create({
    id: PrescriptionId.create(PRESCRIPTION_ID),
    tenantId: TENANT_ID,
    patientId: PATIENT_ID,
    createdByNutritionistId: CREATED_BY_ID,
    responsibleNutritionistId: RESPONSIBLE_ID,
    title: PrescriptionTitle.create('Supplementation protocol'),
    lines: [createEmitReadyLine()],
    now: NOW,
  });
  prescription.clearDomainEvents();
  await repository.save(prescription);
  return prescription;
}

async function seedIssuedPrescription(repository: InMemoryPrescriptionRepository) {
  const draft = await seedDraftPrescription(repository);
  draft.emit(NOW);
  draft.clearDomainEvents();
  await repository.save(draft);
  return draft;
}

describe('EmitPrescriptionHandler', () => {
  it('emits a draft prescription with requirements met', async () => {
    const repository = new InMemoryPrescriptionRepository();
    await seedDraftPrescription(repository);
    const handler = new EmitPrescriptionHandler(
      repository,
      new FixedClock(LATER),
      noopEventDispatcher,
    );

    const result = await handler.execute(
      new EmitPrescriptionCommand({
        tenantId: TENANT_ID,
        prescriptionId: PRESCRIPTION_ID,
      }),
    );

    assert.equal(result.status, PrescriptionStatusValue.Issued);
    assert.equal(result.issuedAt, LATER.toISOString());
    assert.equal(result.version, 2);
  });

  it('throws when prescription is not draft', async () => {
    const repository = new InMemoryPrescriptionRepository();
    await seedIssuedPrescription(repository);
    const handler = new EmitPrescriptionHandler(
      repository,
      new FixedClock(LATER),
      noopEventDispatcher,
    );

    await assert.rejects(
      () =>
        handler.execute(
          new EmitPrescriptionCommand({
            tenantId: TENANT_ID,
            prescriptionId: PRESCRIPTION_ID,
          }),
        ),
      PrescriptionNotDraftError,
    );
  });

  it('throws PrescriptionNotFoundError for wrong tenant', async () => {
    const repository = new InMemoryPrescriptionRepository();
    await seedDraftPrescription(repository);
    const handler = new EmitPrescriptionHandler(
      repository,
      new FixedClock(LATER),
      noopEventDispatcher,
    );

    await assert.rejects(
      () =>
        handler.execute(
          new EmitPrescriptionCommand({
            tenantId: OTHER_TENANT_ID,
            prescriptionId: PRESCRIPTION_ID,
          }),
        ),
      PrescriptionNotFoundError,
    );
  });
});
