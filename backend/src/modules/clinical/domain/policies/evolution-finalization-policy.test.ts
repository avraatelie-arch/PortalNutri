import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { ClinicalEvolution } from '../aggregates/clinical-evolution.aggregate.js';
import { ClinicalEvolutionFinalizationRequirementsNotMetDomainError } from '../errors/clinical-evolution-finalization-requirements-not-met.domain-error.js';
import { ClinicalEvolutionId } from '../value-objects/clinical-evolution-id.js';
import { ClinicalEvolutionStatusValue } from '../value-objects/clinical-evolution-status.js';
import {
  AdherenceAndBarriers,
  AdverseEventsNotes,
  NextClinicalConsiderations,
  ProfessionalObservations,
  SubjectiveEvolution,
  TreatmentResponse,
} from '../value-objects/clinical-evolution-text-sections.js';
import { DefaultEvolutionFinalizationPolicy } from './evolution-finalization-policy.js';

const NOW = new Date('2026-07-20T10:00:00.000Z');
const CLINICAL_MOMENT_AT = new Date('2026-07-20T09:30:00.000Z');

const TENANT_ID = '550e8400-e29b-41d4-a716-446655440001';
const PATIENT_ID = '550e8400-e29b-41d4-a716-446655440020';
const CREATED_BY_ID = '550e8400-e29b-41d4-a716-446655440030';
const RESPONSIBLE_ID = '550e8400-e29b-41d4-a716-446655440031';
const ENCOUNTER_ID = '550e8400-e29b-41d4-a716-446655440050';
const EVOLUTION_ID = ClinicalEvolutionId.create('550e8400-e29b-41d4-a716-446655440070');

function reconstituteEvolution(sections: {
  subjectiveEvolution?: SubjectiveEvolution;
  professionalObservations?: ProfessionalObservations;
  treatmentResponse?: TreatmentResponse;
  nextClinicalConsiderations?: NextClinicalConsiderations;
}) {
  return ClinicalEvolution.reconstitute({
    id: EVOLUTION_ID,
    tenantId: TENANT_ID,
    clinicalEncounterId: ENCOUNTER_ID,
    patientId: PATIENT_ID,
    createdByNutritionistId: CREATED_BY_ID,
    responsibleNutritionistId: RESPONSIBLE_ID,
    clinicalMomentAt: CLINICAL_MOMENT_AT,
    status: ClinicalEvolutionStatusValue.Draft,
    version: 1,
    subjectiveEvolution: sections.subjectiveEvolution ?? SubjectiveEvolution.empty(),
    professionalObservations:
      sections.professionalObservations ?? ProfessionalObservations.empty(),
    treatmentResponse: sections.treatmentResponse ?? TreatmentResponse.empty(),
    adherenceAndBarriers: AdherenceAndBarriers.empty(),
    adverseEventsNotes: AdverseEventsNotes.empty(),
    nextClinicalConsiderations:
      sections.nextClinicalConsiderations ?? NextClinicalConsiderations.empty(),
    finalizedAt: null,
    cancelledAt: null,
    createdAt: NOW,
    updatedAt: NOW,
  });
}

describe('DefaultEvolutionFinalizationPolicy', () => {
  const policy = new DefaultEvolutionFinalizationPolicy();

  it('passes when group A and group B requirements are satisfied', () => {
    const evolution = reconstituteEvolution({
      subjectiveEvolution: SubjectiveEvolution.create('Subjective evidence.'),
      nextClinicalConsiderations: NextClinicalConsiderations.create('Next steps.'),
    });

    assert.doesNotThrow(() => policy.validate(evolution));
  });

  it('throws when group A is missing', () => {
    const evolution = reconstituteEvolution({
      nextClinicalConsiderations: NextClinicalConsiderations.create('Next steps only.'),
    });

    assert.throws(
      () => policy.validate(evolution),
      ClinicalEvolutionFinalizationRequirementsNotMetDomainError,
    );
  });

  it('throws when group B is missing', () => {
    const evolution = reconstituteEvolution({
      treatmentResponse: TreatmentResponse.create('Treatment response only.'),
    });

    assert.throws(
      () => policy.validate(evolution),
      ClinicalEvolutionFinalizationRequirementsNotMetDomainError,
    );
  });

  it('passes with professional observations alone', () => {
    const evolution = reconstituteEvolution({
      professionalObservations: ProfessionalObservations.create(
        'Professional observation satisfies both groups.',
      ),
    });

    assert.doesNotThrow(() => policy.validate(evolution));
  });
});
