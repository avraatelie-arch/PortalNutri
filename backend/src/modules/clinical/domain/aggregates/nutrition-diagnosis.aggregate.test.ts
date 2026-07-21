import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { NutritionDiagnosisCancellationReasonRequiredDomainError } from '../errors/nutrition-diagnosis-cancellation-reason-required.domain-error.js';
import { NutritionDiagnosisInvalidTransitionDomainError } from '../errors/nutrition-diagnosis-invalid-transition.domain-error.js';
import { NutritionDiagnosisInterpretationRequiredDomainError } from '../errors/nutrition-diagnosis-interpretation-required.domain-error.js';
import { NutritionDiagnosisTerminalDomainError } from '../errors/nutrition-diagnosis-terminal.domain-error.js';
import {
  NutritionDiagnosisCancelled,
  NutritionDiagnosisConfirmed,
  NutritionDiagnosisCreated,
  NutritionDiagnosisResponsibleNutritionistChanged,
  NutritionDiagnosisUpdated,
} from '../events/nutrition-diagnosis-events.js';
import { CancellationReason } from '../value-objects/cancellation-reason.js';
import { NutritionDiagnosisId } from '../value-objects/nutrition-diagnosis-id.js';
import { NutritionDiagnosisStatusValue } from '../value-objects/nutrition-diagnosis-status.js';
import { NutritionProblemCategory } from '../value-objects/nutrition-problem-category.js';
import { ProfessionalInterpretation } from '../value-objects/professional-interpretation.js';
import { NutritionDiagnosis } from './nutrition-diagnosis.aggregate.js';

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
const DIAGNOSIS_ID = NutritionDiagnosisId.create(
  '550e8400-e29b-41d4-a716-446655440080',
);

const PROBLEM_CATEGORY = NutritionProblemCategory.parse('ENERGY_BALANCE');

function createDraftDiagnosis(params?: {
  interpretation?: ProfessionalInterpretation;
  problemCategory?: NutritionProblemCategory;
}) {
  return NutritionDiagnosis.create({
    id: DIAGNOSIS_ID,
    tenantId: TENANT_ID,
    patientId: PATIENT_ID,
    createdByNutritionistId: CREATED_BY_ID,
    responsibleNutritionistId: RESPONSIBLE_ID,
    originClinicalEncounterId: ENCOUNTER_ID,
    originAnamnesisId: ANAMNESIS_ID,
    problemCategory: params?.problemCategory,
    professionalInterpretation: params?.interpretation,
    now: NOW,
  });
}

function confirmDiagnosis(
  diagnosis: NutritionDiagnosis,
  at: Date = LATER,
): void {
  diagnosis.clearDomainEvents();

  if (diagnosis.getProfessionalInterpretation().isEmpty()) {
    diagnosis.edit(
      {
        professionalInterpretation: ProfessionalInterpretation.create(
          'Excessive energy intake relative to expenditure.',
        ),
      },
      at,
    );
    diagnosis.clearDomainEvents();
  }

  diagnosis.confirm(at);
}

function reconstituteDiagnosis(params: {
  status: (typeof NutritionDiagnosisStatusValue)[keyof typeof NutritionDiagnosisStatusValue];
  version?: number;
  interpretation?: ProfessionalInterpretation;
  confirmedAt?: Date | null;
  cancelledAt?: Date | null;
  cancellationReason?: CancellationReason | null;
}) {
  return NutritionDiagnosis.reconstitute({
    id: DIAGNOSIS_ID,
    tenantId: TENANT_ID,
    patientId: PATIENT_ID,
    createdByNutritionistId: CREATED_BY_ID,
    responsibleNutritionistId: RESPONSIBLE_ID,
    originClinicalEncounterId: ENCOUNTER_ID,
    originAnamnesisId: ANAMNESIS_ID,
    problemCategory: PROBLEM_CATEGORY,
    status: params.status,
    version: params.version ?? 1,
    professionalInterpretation:
      params.interpretation
      ?? ProfessionalInterpretation.create('Existing interpretation text'),
    cancellationReason: params.cancellationReason ?? null,
    confirmedAt: params.confirmedAt ?? null,
    cancelledAt: params.cancelledAt ?? null,
    createdAt: NOW,
    updatedAt: NOW,
  });
}

function assertEventHasNoClinicalText(event: unknown): void {
  const serialized = JSON.stringify(event);

  assert.doesNotMatch(serialized, /Excessive energy intake/i);
  assert.doesNotMatch(serialized, /Existing interpretation text/i);
  assert.doesNotMatch(serialized, /Updated interpretation/i);
  assert.doesNotMatch(serialized, /Administrative correction/i);
}

describe('NutritionDiagnosis aggregate', () => {
  it('creates in DRAFT with OTHER category, empty interpretation and version 1', () => {
    const diagnosis = createDraftDiagnosis();
    const event = diagnosis.domainEvents[0] as NutritionDiagnosisCreated;

    assert.equal(diagnosis.getStatus(), NutritionDiagnosisStatusValue.Draft);
    assert.equal(diagnosis.getVersion(), 1);
    assert.equal(diagnosis.getProblemCategory().toString(), 'OTHER');
    assert.equal(diagnosis.getProfessionalInterpretation().isEmpty(), true);
    assert.equal(diagnosis.getOriginClinicalEncounterId(), ENCOUNTER_ID);
    assert.equal(diagnosis.getOriginAnamnesisId(), ANAMNESIS_ID);
    assert.equal(event.eventName, 'NutritionDiagnosisCreated');
    assert.equal(event.aggregateId, DIAGNOSIS_ID.toString());
    assert.equal(event.problemCategory, 'OTHER');
    assertEventHasNoClinicalText(event);
  });

  it('allows empty interpretation in DRAFT', () => {
    const diagnosis = createDraftDiagnosis({
      interpretation: ProfessionalInterpretation.empty(),
    });

    assert.equal(diagnosis.getProfessionalInterpretation().isEmpty(), true);
  });

  it('confirms from DRAFT with interpretation and increments version', () => {
    const diagnosis = createDraftDiagnosis({
      interpretation: ProfessionalInterpretation.create(
        'Excessive energy intake relative to expenditure.',
      ),
      problemCategory: PROBLEM_CATEGORY,
    });
    diagnosis.clearDomainEvents();

    diagnosis.confirm(LATER);

    assert.equal(diagnosis.getStatus(), NutritionDiagnosisStatusValue.Confirmed);
    assert.equal(diagnosis.getVersion(), 2);
    assert.deepEqual(diagnosis.getConfirmedAt(), LATER);

    const event = diagnosis.domainEvents[0] as NutritionDiagnosisConfirmed;
    assert.equal(event.eventName, 'NutritionDiagnosisConfirmed');
    assert.equal(event.version, 2);
    assertEventHasNoClinicalText(event);
  });

  it('rejects confirmation without interpretation', () => {
    const diagnosis = createDraftDiagnosis();

    assert.throws(
      () => diagnosis.confirm(LATER),
      NutritionDiagnosisInterpretationRequiredDomainError,
    );
  });

  it('cancels from DRAFT without cancellation reason', () => {
    const diagnosis = createDraftDiagnosis();
    diagnosis.clearDomainEvents();

    diagnosis.cancel({}, LATER);

    assert.equal(diagnosis.getStatus(), NutritionDiagnosisStatusValue.Cancelled);
    assert.equal(diagnosis.getCancellationReason(), null);
    assert.deepEqual(diagnosis.getCancelledAt(), LATER);
  });

  it('cancels from CONFIRMED when cancellation reason is provided', () => {
    const diagnosis = createDraftDiagnosis({
      interpretation: ProfessionalInterpretation.create(
        'Excessive energy intake relative to expenditure.',
      ),
    });
    confirmDiagnosis(diagnosis);
    diagnosis.clearDomainEvents();

    diagnosis.cancel(
      {
        cancellationReason: CancellationReason.create('Administrative correction'),
      },
      LATER,
    );

    assert.equal(diagnosis.getStatus(), NutritionDiagnosisStatusValue.Cancelled);
    assert.equal(
      diagnosis.getCancellationReason()?.toPersistence(),
      'Administrative correction',
    );
  });

  it('rejects cancel CONFIRMED without cancellation reason', () => {
    const diagnosis = createDraftDiagnosis({
      interpretation: ProfessionalInterpretation.create(
        'Excessive energy intake relative to expenditure.',
      ),
    });
    confirmDiagnosis(diagnosis);

    assert.throws(
      () => diagnosis.cancel({}, LATER),
      NutritionDiagnosisCancellationReasonRequiredDomainError,
    );
  });

  it('rejects invalid lifecycle transitions', () => {
    const diagnosis = createDraftDiagnosis({
      interpretation: ProfessionalInterpretation.create(
        'Excessive energy intake relative to expenditure.',
      ),
    });

    confirmDiagnosis(diagnosis);

    assert.throws(
      () => diagnosis.confirm(LATER),
      NutritionDiagnosisInvalidTransitionDomainError,
    );
    assert.throws(
      () => diagnosis.edit({ problemCategory: PROBLEM_CATEGORY }, LATER),
      NutritionDiagnosisInvalidTransitionDomainError,
    );
  });

  it('rejects mutations in terminal CANCELLED state', () => {
    const cancelled = reconstituteDiagnosis({
      status: NutritionDiagnosisStatusValue.Cancelled,
      cancelledAt: NEXT_DAY,
    });

    assert.throws(
      () =>
        cancelled.edit(
          { problemCategory: NutritionProblemCategory.parse('DYSPHAGIA') },
          NEXT_DAY,
        ),
      NutritionDiagnosisTerminalDomainError,
    );
    assert.throws(
      () => cancelled.changeResponsibleNutritionist(NEW_RESPONSIBLE_ID, NEXT_DAY),
      NutritionDiagnosisTerminalDomainError,
    );
    assert.throws(() => cancelled.cancel({}, NEXT_DAY), NutritionDiagnosisTerminalDomainError);
  });

  it('edit returns changed field names and emits NutritionDiagnosisUpdated without text', () => {
    const diagnosis = createDraftDiagnosis({
      problemCategory: NutritionProblemCategory.parse('OTHER'),
    });
    diagnosis.clearDomainEvents();

    const changedFields = diagnosis.edit(
      {
        problemCategory: PROBLEM_CATEGORY,
        professionalInterpretation: ProfessionalInterpretation.create(
          'Updated interpretation details',
        ),
      },
      LATER,
    );

    assert.deepEqual(changedFields, ['problemCategory', 'professionalInterpretation']);
    assert.equal(diagnosis.getVersion(), 2);

    const event = diagnosis.domainEvents[0] as NutritionDiagnosisUpdated;
    assert.equal(event.eventName, 'NutritionDiagnosisUpdated');
    assert.deepEqual(event.changedFields, ['problemCategory', 'professionalInterpretation']);
    assertEventHasNoClinicalText(event);
  });

  it('edit is idempotent when values are unchanged', () => {
    const interpretation = ProfessionalInterpretation.create(
      'Excessive energy intake relative to expenditure.',
    );
    const diagnosis = createDraftDiagnosis({
      interpretation,
      problemCategory: PROBLEM_CATEGORY,
    });
    diagnosis.clearDomainEvents();

    const changedFields = diagnosis.edit(
      {
        problemCategory: PROBLEM_CATEGORY,
        professionalInterpretation: interpretation,
      },
      LATER,
    );

    assert.deepEqual(changedFields, []);
    assert.equal(diagnosis.getVersion(), 1);
    assert.equal(diagnosis.domainEvents.length, 0);
  });

  it('changeResponsibleNutritionist updates owner and emits event', () => {
    const diagnosis = createDraftDiagnosis();
    diagnosis.clearDomainEvents();

    const changed = diagnosis.changeResponsibleNutritionist(NEW_RESPONSIBLE_ID, LATER);

    assert.equal(changed, true);
    assert.equal(diagnosis.getResponsibleNutritionistId(), NEW_RESPONSIBLE_ID);
    assert.equal(diagnosis.getVersion(), 2);

    const event =
      diagnosis.domainEvents[0] as NutritionDiagnosisResponsibleNutritionistChanged;
    assert.equal(event.eventName, 'NutritionDiagnosisResponsibleNutritionistChanged');
    assert.equal(event.responsibleNutritionistId, NEW_RESPONSIBLE_ID);
    assertEventHasNoClinicalText(event);
  });

  it('changeResponsibleNutritionist is idempotent when unchanged', () => {
    const diagnosis = createDraftDiagnosis();
    diagnosis.clearDomainEvents();

    const changed = diagnosis.changeResponsibleNutritionist(RESPONSIBLE_ID, LATER);

    assert.equal(changed, false);
    assert.equal(diagnosis.getVersion(), 1);
    assert.equal(diagnosis.domainEvents.length, 0);
  });

  it('allows multiple CONFIRMED diagnoses to coexist conceptually via independent aggregates', () => {
    const first = createDraftDiagnosis({
      interpretation: ProfessionalInterpretation.create('First confirmed diagnosis'),
    });
    confirmDiagnosis(first);

    const second = NutritionDiagnosis.create({
      tenantId: TENANT_ID,
      patientId: PATIENT_ID,
      createdByNutritionistId: CREATED_BY_ID,
      responsibleNutritionistId: RESPONSIBLE_ID,
      professionalInterpretation: ProfessionalInterpretation.create(
        'Second confirmed diagnosis',
      ),
      now: LATER,
    });
    second.confirm(NEXT_DAY);

    assert.equal(first.getStatus(), NutritionDiagnosisStatusValue.Confirmed);
    assert.equal(second.getStatus(), NutritionDiagnosisStatusValue.Confirmed);
    assert.notEqual(first.getId().toString(), second.getId().toString());
  });

  it('cancel emits NutritionDiagnosisCancelled without clinical text', () => {
    const diagnosis = createDraftDiagnosis();
    diagnosis.clearDomainEvents();

    diagnosis.cancel({}, LATER);

    const event = diagnosis.domainEvents[0] as NutritionDiagnosisCancelled;
    assert.equal(event.eventName, 'NutritionDiagnosisCancelled');
    assertEventHasNoClinicalText(event);
  });

  it('getEffectiveAt returns confirmedAt when confirmed otherwise createdAt', () => {
    const draft = createDraftDiagnosis();
    assert.deepEqual(draft.getEffectiveAt(), NOW);

    confirmDiagnosis(draft, LATER);
    assert.deepEqual(draft.getEffectiveAt(), LATER);
  });
});
