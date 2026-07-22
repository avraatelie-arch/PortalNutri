import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { ClinicalEvolution } from '../aggregates/clinical-evolution.aggregate.js';
import { ClinicalEvolutionFinalizationRequirementsNotMetDomainError } from '../errors/clinical-evolution-finalization-requirements-not-met.domain-error.js';
import { ClinicalEvolutionInvalidTransitionDomainError } from '../errors/clinical-evolution-invalid-transition.domain-error.js';
import { ClinicalEvolutionNotDraftDomainError } from '../errors/clinical-evolution-not-draft.domain-error.js';
import { ClinicalEvolutionTerminalDomainError } from '../errors/clinical-evolution-terminal.domain-error.js';
import {
  ClinicalEvolutionCancelled,
  ClinicalEvolutionFinalized,
  ClinicalEvolutionResponsibleNutritionistChanged,
  ClinicalEvolutionStarted,
  ClinicalEvolutionUpdated,
} from '../events/clinical-evolution-events.js';
import { DefaultEvolutionFinalizationPolicy } from '../policies/evolution-finalization-policy.js';
import { ClinicalEvolutionId } from '../value-objects/clinical-evolution-id.js';
import {
  ClinicalEvolutionSection,
  ClinicalEvolutionSectionValue,
} from '../value-objects/clinical-evolution-section.js';
import { ClinicalEvolutionStatusValue } from '../value-objects/clinical-evolution-status.js';
import {
  AdherenceAndBarriers,
  AdverseEventsNotes,
  NextClinicalConsiderations,
  ProfessionalObservations,
  SubjectiveEvolution,
  TreatmentResponse,
} from '../value-objects/clinical-evolution-text-sections.js';

const NOW = new Date('2026-07-20T10:00:00.000Z');
const LATER = new Date('2026-07-20T11:00:00.000Z');
const NEXT_DAY = new Date('2026-07-21T10:00:00.000Z');
const CLINICAL_MOMENT_AT = new Date('2026-07-20T09:30:00.000Z');

const TENANT_ID = '550e8400-e29b-41d4-a716-446655440001';
const PATIENT_ID = '550e8400-e29b-41d4-a716-446655440020';
const CREATED_BY_ID = '550e8400-e29b-41d4-a716-446655440030';
const RESPONSIBLE_ID = '550e8400-e29b-41d4-a716-446655440031';
const NEW_RESPONSIBLE_ID = '550e8400-e29b-41d4-a716-446655440032';
const ENCOUNTER_ID = '550e8400-e29b-41d4-a716-446655440050';
const EVOLUTION_ID = ClinicalEvolutionId.create('550e8400-e29b-41d4-a716-446655440070');

const policy = new DefaultEvolutionFinalizationPolicy();

function createDraftEvolution() {
  return ClinicalEvolution.create({
    id: EVOLUTION_ID,
    tenantId: TENANT_ID,
    clinicalEncounterId: ENCOUNTER_ID,
    patientId: PATIENT_ID,
    createdByNutritionistId: CREATED_BY_ID,
    responsibleNutritionistId: RESPONSIBLE_ID,
    clinicalMomentAt: CLINICAL_MOMENT_AT,
    now: NOW,
  });
}

function fillFinalizationRequirements(evolution: ClinicalEvolution, at: Date = LATER): void {
  evolution.updateSection(
    ClinicalEvolutionSection.fromValue(ClinicalEvolutionSectionValue.SubjectiveEvolution),
    SubjectiveEvolution.create('Patient reports improved energy levels.'),
    at,
  );
  evolution.updateSection(
    ClinicalEvolutionSection.fromValue(ClinicalEvolutionSectionValue.NextClinicalConsiderations),
    NextClinicalConsiderations.create('Continue current plan and reassess in two weeks.'),
    at,
  );
}

function finalizeEvolution(evolution: ClinicalEvolution, at: Date = LATER): void {
  fillFinalizationRequirements(evolution, at);
  evolution.clearDomainEvents();
  evolution.finalize(at, policy);
}

function assertEventHasNoClinicalText(event: unknown): void {
  const serialized = JSON.stringify(event);

  assert.doesNotMatch(serialized, /improved energy levels/i);
  assert.doesNotMatch(serialized, /Continue current plan/i);
  assert.doesNotMatch(serialized, /Professional observation/i);
  assert.doesNotMatch(serialized, /Treatment response/i);
}

describe('ClinicalEvolution aggregate', () => {
  it('creates in DRAFT with immutable clinicalMomentAt snapshot and version 1', () => {
    const evolution = createDraftEvolution();
    const event = evolution.domainEvents[0] as ClinicalEvolutionStarted;

    assert.equal(evolution.getStatus(), ClinicalEvolutionStatusValue.Draft);
    assert.equal(evolution.getVersion(), 1);
    assert.deepEqual(evolution.getClinicalMomentAt(), CLINICAL_MOMENT_AT);
    assert.equal(evolution.getClinicalEncounterId(), ENCOUNTER_ID);
    assert.equal(evolution.getCreatedByNutritionistId(), CREATED_BY_ID);
    assert.equal(evolution.getResponsibleNutritionistId(), RESPONSIBLE_ID);
    assert.equal(event.eventName, 'ClinicalEvolutionStarted');
    assert.deepEqual(event.clinicalMomentAt, CLINICAL_MOMENT_AT);
    assertEventHasNoClinicalText(event);
  });

  it('updateSection emits ClinicalEvolutionUpdated without section text', () => {
    const evolution = createDraftEvolution();
    evolution.clearDomainEvents();

    const changed = evolution.updateSection(
      ClinicalEvolutionSection.fromValue(ClinicalEvolutionSectionValue.SubjectiveEvolution),
      SubjectiveEvolution.create('Patient reports improved energy levels.'),
      LATER,
    );

    assert.equal(changed, true);
    assert.equal(evolution.getVersion(), 2);

    const event = evolution.domainEvents[0] as ClinicalEvolutionUpdated;
    assert.equal(event.eventName, 'ClinicalEvolutionUpdated');
    assert.equal(event.section, ClinicalEvolutionSectionValue.SubjectiveEvolution);
    assert.deepEqual(event.clinicalMomentAt, CLINICAL_MOMENT_AT);
    assertEventHasNoClinicalText(event);
  });

  it('updateSection returns false when section value is unchanged', () => {
    const evolution = createDraftEvolution();
    const section = ClinicalEvolutionSection.fromValue(
      ClinicalEvolutionSectionValue.SubjectiveEvolution,
    );
    const value = SubjectiveEvolution.create('Unchanged subjective note.');

    evolution.updateSection(section, value, LATER);
    evolution.clearDomainEvents();

    const changed = evolution.updateSection(section, value, NEXT_DAY);

    assert.equal(changed, false);
    assert.equal(evolution.getVersion(), 2);
    assert.equal(evolution.domainEvents.length, 0);
  });

  it('finalizes from DRAFT when finalization policy requirements are met', () => {
    const evolution = createDraftEvolution();
    finalizeEvolution(evolution);

    assert.equal(evolution.getStatus(), ClinicalEvolutionStatusValue.Finalized);
    assert.equal(evolution.getVersion(), 4);
    assert.deepEqual(evolution.getFinalizedAt(), LATER);

    const event = evolution.domainEvents[0] as ClinicalEvolutionFinalized;
    assert.equal(event.eventName, 'ClinicalEvolutionFinalized');
    assert.deepEqual(event.clinicalMomentAt, CLINICAL_MOMENT_AT);
    assertEventHasNoClinicalText(event);
  });

  it('rejects finalize when group A evidence is missing', () => {
    const evolution = createDraftEvolution();

    evolution.updateSection(
      ClinicalEvolutionSection.fromValue(
        ClinicalEvolutionSectionValue.NextClinicalConsiderations,
      ),
      NextClinicalConsiderations.create('Plan next steps only.'),
      LATER,
    );

    assert.throws(
      () => evolution.finalize(LATER, policy),
      ClinicalEvolutionFinalizationRequirementsNotMetDomainError,
    );
  });

  it('rejects finalize when group B conclusion is missing', () => {
    const evolution = createDraftEvolution();

    evolution.updateSection(
      ClinicalEvolutionSection.fromValue(ClinicalEvolutionSectionValue.SubjectiveEvolution),
      SubjectiveEvolution.create('Subjective only.'),
      LATER,
    );

    assert.throws(
      () => evolution.finalize(LATER, policy),
      ClinicalEvolutionFinalizationRequirementsNotMetDomainError,
    );
  });

  it('allows finalize when professional observations satisfy both policy groups', () => {
    const evolution = createDraftEvolution();

    evolution.updateSection(
      ClinicalEvolutionSection.fromValue(
        ClinicalEvolutionSectionValue.ProfessionalObservations,
      ),
      ProfessionalObservations.create('Professional observation documented.'),
      LATER,
    );
    evolution.clearDomainEvents();

    evolution.finalize(LATER, policy);

    assert.equal(evolution.getStatus(), ClinicalEvolutionStatusValue.Finalized);
  });

  it('cancels from DRAFT only', () => {
    const evolution = createDraftEvolution();
    evolution.clearDomainEvents();

    evolution.cancel(LATER);

    assert.equal(evolution.getStatus(), ClinicalEvolutionStatusValue.Cancelled);
    assert.deepEqual(evolution.getCancelledAt(), LATER);

    const event = evolution.domainEvents[0] as ClinicalEvolutionCancelled;
    assert.equal(event.eventName, 'ClinicalEvolutionCancelled');
    assertEventHasNoClinicalText(event);
  });

  it('rejects edit on FINALIZED with ClinicalEvolutionNotDraftDomainError', () => {
    const evolution = createDraftEvolution();
    finalizeEvolution(evolution);

    assert.throws(
      () =>
        evolution.updateSection(
          ClinicalEvolutionSection.fromValue(
            ClinicalEvolutionSectionValue.TreatmentResponse,
          ),
          TreatmentResponse.create('Late treatment response edit.'),
          NEXT_DAY,
        ),
      ClinicalEvolutionNotDraftDomainError,
    );
  });

  it('rejects invalid lifecycle transitions after FINALIZED', () => {
    const evolution = createDraftEvolution();
    finalizeEvolution(evolution);

    assert.throws(
      () => evolution.finalize(NEXT_DAY, policy),
      ClinicalEvolutionInvalidTransitionDomainError,
    );
    assert.throws(
      () => evolution.cancel(NEXT_DAY),
      ClinicalEvolutionInvalidTransitionDomainError,
    );
  });

  it('changeResponsibleNutritionist works on DRAFT and FINALIZED', () => {
    const draft = createDraftEvolution();
    draft.clearDomainEvents();

    assert.equal(draft.changeResponsibleNutritionist(NEW_RESPONSIBLE_ID, LATER), true);
    assert.equal(draft.getResponsibleNutritionistId(), NEW_RESPONSIBLE_ID);

    const draftEvent = draft.domainEvents[0] as ClinicalEvolutionResponsibleNutritionistChanged;
    assert.equal(draftEvent.eventName, 'ClinicalEvolutionResponsibleNutritionistChanged');
    assertEventHasNoClinicalText(draftEvent);

    const finalized = createDraftEvolution();
    finalizeEvolution(finalized);
    finalized.clearDomainEvents();

    assert.equal(
      finalized.changeResponsibleNutritionist(NEW_RESPONSIBLE_ID, NEXT_DAY),
      true,
    );
    assert.equal(finalized.getResponsibleNutritionistId(), NEW_RESPONSIBLE_ID);
  });

  it('rejects mutations in terminal CANCELLED state', () => {
    const cancelled = ClinicalEvolution.reconstitute({
      id: EVOLUTION_ID,
      tenantId: TENANT_ID,
      clinicalEncounterId: ENCOUNTER_ID,
      patientId: PATIENT_ID,
      createdByNutritionistId: CREATED_BY_ID,
      responsibleNutritionistId: RESPONSIBLE_ID,
      clinicalMomentAt: CLINICAL_MOMENT_AT,
      status: ClinicalEvolutionStatusValue.Cancelled,
      version: 2,
      subjectiveEvolution: SubjectiveEvolution.empty(),
      professionalObservations: ProfessionalObservations.empty(),
      treatmentResponse: TreatmentResponse.empty(),
      adherenceAndBarriers: AdherenceAndBarriers.empty(),
      adverseEventsNotes: AdverseEventsNotes.empty(),
      nextClinicalConsiderations: NextClinicalConsiderations.empty(),
      finalizedAt: null,
      cancelledAt: NEXT_DAY,
      createdAt: NOW,
      updatedAt: NEXT_DAY,
    });

    assert.throws(
      () =>
        cancelled.updateSection(
          ClinicalEvolutionSection.fromValue(
            ClinicalEvolutionSectionValue.SubjectiveEvolution,
          ),
          SubjectiveEvolution.create('Should not update.'),
          NEXT_DAY,
        ),
      ClinicalEvolutionTerminalDomainError,
    );
    assert.throws(
      () => cancelled.cancel(NEXT_DAY),
      ClinicalEvolutionTerminalDomainError,
    );
    assert.throws(
      () => cancelled.changeResponsibleNutritionist(NEW_RESPONSIBLE_ID, NEXT_DAY),
      ClinicalEvolutionTerminalDomainError,
    );
  });

  it('does not expose getEffectiveAt', () => {
    const evolution = createDraftEvolution();

    assert.equal(
      'getEffectiveAt' in evolution && typeof (evolution as { getEffectiveAt?: () => Date }).getEffectiveAt === 'function',
      false,
    );
  });
});
