import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { PrescriptionLine } from '../entities/prescription-line.js';
import { PrescriptionCancellationReasonRequiredDomainError } from '../errors/prescription-cancellation-reason-required.domain-error.js';
import { PrescriptionDuplicateLineDescriptionDomainError } from '../errors/prescription-duplicate-line-description.domain-error.js';
import { PrescriptionEmitRequirementsNotMetDomainError } from '../errors/prescription-emit-requirements-not-met.domain-error.js';
import { PrescriptionInvalidTransitionDomainError } from '../errors/prescription-invalid-transition.domain-error.js';
import {
  PRESCRIPTION_MAX_LINES,
  PrescriptionMaxLinesExceededDomainError,
} from '../errors/prescription-max-lines-exceeded.domain-error.js';
import { PrescriptionTerminalDomainError } from '../errors/prescription-terminal.domain-error.js';
import {
  PrescriptionCancelled,
  PrescriptionCreated,
  PrescriptionIssued,
  PrescriptionResponsibleNutritionistChanged,
  PrescriptionUpdated,
} from '../events/prescription-events.js';
import { Dose } from '../value-objects/dose.js';
import { DoseUnitValue } from '../value-objects/dose-unit.js';
import { Frequency } from '../value-objects/frequency.js';
import { PrescriptionCancellationReason } from '../value-objects/prescription-cancellation-reason.js';
import { PrescriptionId } from '../value-objects/prescription-id.js';
import { PrescriptionLineDescription } from '../value-objects/prescription-line-description.js';
import { PrescriptionStatusValue } from '../value-objects/prescription-status.js';
import { PrescriptionTitle } from '../value-objects/prescription-title.js';
import { PrescriptionClinicalNotes, PatientInstructions } from '../value-objects/prescription-text-sections.js';
import { Prescription } from './prescription.aggregate.js';

const NOW = new Date('2026-07-20T10:00:00.000Z');
const LATER = new Date('2026-07-20T11:00:00.000Z');
const NEXT_DAY = new Date('2026-07-21T10:00:00.000Z');

const TENANT_ID = '550e8400-e29b-41d4-a716-446655440001';
const PATIENT_ID = '550e8400-e29b-41d4-a716-446655440020';
const CREATED_BY_ID = '550e8400-e29b-41d4-a716-446655440030';
const RESPONSIBLE_ID = '550e8400-e29b-41d4-a716-446655440031';
const NEW_RESPONSIBLE_ID = '550e8400-e29b-41d4-a716-446655440032';
const ENCOUNTER_ID = '550e8400-e29b-41d4-a716-446655440050';
const ANAMNESIS_ID = '550e8400-e29b-41d4-a716-446655440060';
const PRESCRIPTION_ID = PrescriptionId.create('550e8400-e29b-41d4-a716-446655440091');

function createLine(description = 'Omega-3 supplement') {
  return PrescriptionLine.create({
    sortOrder: 1,
    description: PrescriptionLineDescription.create(description),
    dose: Dose.create({ quantity: '1000', unit: DoseUnitValue.Mg }),
    frequency: Frequency.create({ displayText: 'Once daily with breakfast' }),
  });
}

function createDraftPrescription(params?: {
  title?: PrescriptionTitle;
  lines?: PrescriptionLine[];
}) {
  return Prescription.create({
    id: PRESCRIPTION_ID,
    tenantId: TENANT_ID,
    patientId: PATIENT_ID,
    createdByNutritionistId: CREATED_BY_ID,
    responsibleNutritionistId: RESPONSIBLE_ID,
    originClinicalEncounterId: ENCOUNTER_ID,
    originAnamnesisId: ANAMNESIS_ID,
    title: params?.title,
    lines: params?.lines,
    now: NOW,
  });
}

function emitPrescription(prescription: Prescription, at: Date = LATER): void {
  prescription.clearDomainEvents();

  if (prescription.getTitle().isEmpty()) {
    prescription.edit({ title: PrescriptionTitle.create('Therapeutic prescription') }, at);
    prescription.clearDomainEvents();
  }

  if (prescription.getLines().length === 0) {
    prescription.edit({ lines: [createLine()] }, at);
    prescription.clearDomainEvents();
  }

  prescription.emit(at);
}

function assertEventHasNoClinicalText(event: unknown): void {
  const serialized = JSON.stringify(event);

  assert.doesNotMatch(serialized, /Omega-3 supplement/i);
  assert.doesNotMatch(serialized, /Once daily/i);
  assert.doesNotMatch(serialized, /Administrative correction/i);
}

describe('Prescription aggregate', () => {
  it('creates in DRAFT with empty title and version 1', () => {
    const prescription = createDraftPrescription();
    const event = prescription.domainEvents[0] as PrescriptionCreated;

    assert.equal(prescription.getStatus(), PrescriptionStatusValue.Draft);
    assert.equal(prescription.getVersion(), 1);
    assert.equal(prescription.getTitle().isEmpty(), true);
    assert.equal(event.eventName, 'PrescriptionCreated');
    assertEventHasNoClinicalText(event);
  });

  it('emits from DRAFT with title and complete line', () => {
    const prescription = createDraftPrescription({
      title: PrescriptionTitle.create('Supplement protocol'),
      lines: [createLine()],
    });
    prescription.clearDomainEvents();

    prescription.emit(LATER);

    assert.equal(prescription.getStatus(), PrescriptionStatusValue.Issued);
    assert.equal(prescription.getVersion(), 2);
    assert.deepEqual(prescription.getIssuedAt(), LATER);

    const event = prescription.domainEvents[0] as PrescriptionIssued;
    assert.equal(event.eventName, 'PrescriptionIssued');
    assertEventHasNoClinicalText(event);
  });

  it('rejects emit without title', () => {
    const prescription = createDraftPrescription({ lines: [createLine()] });

    assert.throws(
      () => prescription.emit(LATER),
      PrescriptionEmitRequirementsNotMetDomainError,
    );
  });

  it('rejects emit without complete lines', () => {
    const prescription = createDraftPrescription({
      title: PrescriptionTitle.create('Title only'),
    });

    assert.throws(
      () => prescription.emit(LATER),
      PrescriptionEmitRequirementsNotMetDomainError,
    );
  });

  it('rejects duplicate normalized line descriptions at emit', () => {
    const prescription = createDraftPrescription({
      title: PrescriptionTitle.create('Duplicate lines'),
      lines: [
        createLine('  Omega-3   Supplement '),
        createLine('omega-3 supplement'),
      ],
    });

    assert.throws(
      () => prescription.emit(LATER),
      PrescriptionDuplicateLineDescriptionDomainError,
    );
  });

  it('cancels from DRAFT without cancellation reason', () => {
    const prescription = createDraftPrescription();
    prescription.clearDomainEvents();

    prescription.cancel({}, LATER);

    assert.equal(prescription.getStatus(), PrescriptionStatusValue.Cancelled);
    assert.equal(prescription.getCancellationReason(), null);
  });

  it('cancels from ISSUED when cancellation reason is provided', () => {
    const prescription = createDraftPrescription({
      title: PrescriptionTitle.create('Issued prescription'),
      lines: [createLine()],
    });
    emitPrescription(prescription);
    prescription.clearDomainEvents();

    prescription.cancel(
      {
        cancellationReason: PrescriptionCancellationReason.create('Administrative correction'),
      },
      LATER,
    );

    assert.equal(prescription.getStatus(), PrescriptionStatusValue.Cancelled);
  });

  it('rejects invalid lifecycle transitions after ISSUED', () => {
    const prescription = createDraftPrescription({
      title: PrescriptionTitle.create('Issued prescription'),
      lines: [createLine()],
    });
    emitPrescription(prescription);

    assert.throws(
      () => prescription.emit(LATER),
      PrescriptionInvalidTransitionDomainError,
    );
    assert.throws(
      () => prescription.edit({ title: PrescriptionTitle.create('Updated') }, LATER),
      PrescriptionInvalidTransitionDomainError,
    );
  });

  it('edit emits PrescriptionUpdated without clinical text', () => {
    const prescription = createDraftPrescription();
    prescription.clearDomainEvents();

    const changedFields = prescription.edit(
      {
        title: PrescriptionTitle.create('Updated title'),
        clinicalNotes: PrescriptionClinicalNotes.create('Monitor tolerance weekly.'),
        patientInstructions: PatientInstructions.create('Take with food.'),
        lines: [createLine('Magnesium glycinate')],
      },
      LATER,
    );

    assert.deepEqual(changedFields, [
      'title',
      'clinicalNotes',
      'patientInstructions',
      'lines',
    ]);

    const event = prescription.domainEvents[0] as PrescriptionUpdated;
    assert.equal(event.eventName, 'PrescriptionUpdated');
    assertEventHasNoClinicalText(event);
  });

  it('rejects more than maximum allowed lines', () => {
    const lines = Array.from({ length: PRESCRIPTION_MAX_LINES + 1 }, (_, index) =>
      PrescriptionLine.create({
        sortOrder: index + 1,
        description: PrescriptionLineDescription.create(`Line ${index + 1}`),
      }),
    );

    assert.throws(
      () => createDraftPrescription({ lines }),
      PrescriptionMaxLinesExceededDomainError,
    );
  });

  it('changeResponsibleNutritionist updates owner and emits event', () => {
    const prescription = createDraftPrescription();
    prescription.clearDomainEvents();

    const changed = prescription.changeResponsibleNutritionist(NEW_RESPONSIBLE_ID, LATER);

    assert.equal(changed, true);
    assert.equal(prescription.getResponsibleNutritionistId(), NEW_RESPONSIBLE_ID);

    const event = prescription.domainEvents[0] as PrescriptionResponsibleNutritionistChanged;
    assert.equal(event.eventName, 'PrescriptionResponsibleNutritionistChanged');
    assertEventHasNoClinicalText(event);
  });

  it('getEffectiveAt returns issuedAt when issued otherwise createdAt', () => {
    const draft = createDraftPrescription();
    assert.deepEqual(draft.getEffectiveAt(), NOW);

    emitPrescription(draft, LATER);
    assert.deepEqual(draft.getEffectiveAt(), LATER);
  });

  it('rejects mutations in terminal CANCELLED state', () => {
    const cancelled = Prescription.reconstitute({
      id: PRESCRIPTION_ID,
      tenantId: TENANT_ID,
      patientId: PATIENT_ID,
      createdByNutritionistId: CREATED_BY_ID,
      responsibleNutritionistId: RESPONSIBLE_ID,
      originClinicalEncounterId: ENCOUNTER_ID,
      originAnamnesisId: ANAMNESIS_ID,
      status: PrescriptionStatusValue.Cancelled,
      version: 3,
      title: PrescriptionTitle.create('Cancelled prescription'),
      clinicalNotes: PrescriptionClinicalNotes.empty(),
      patientInstructions: PatientInstructions.empty(),
      cancellationReason: null,
      issuedAt: NOW,
      cancelledAt: NEXT_DAY,
      lines: [createLine()],
      createdAt: NOW,
      updatedAt: NEXT_DAY,
    });

    assert.throws(
      () => cancelled.edit({ title: PrescriptionTitle.create('Updated') }, NEXT_DAY),
      PrescriptionTerminalDomainError,
    );
    assert.throws(
      () => cancelled.cancel({}, NEXT_DAY),
      PrescriptionTerminalDomainError,
    );
  });

  it('cancel emits PrescriptionCancelled without clinical text', () => {
    const prescription = createDraftPrescription();
    prescription.clearDomainEvents();

    prescription.cancel({}, LATER);

    const event = prescription.domainEvents[0] as PrescriptionCancelled;
    assert.equal(event.eventName, 'PrescriptionCancelled');
    assertEventHasNoClinicalText(event);
  });
});
