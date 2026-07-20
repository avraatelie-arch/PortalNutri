import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { Anamnesis } from '../aggregates/anamnesis.aggregate.js';
import { AnamnesisIncompleteDomainError } from '../errors/anamnesis-incomplete.domain-error.js';
import { AnamnesisId } from '../value-objects/anamnesis-id.js';
import {
  ANAMNESIS_SECTION_MAX_LENGTH,
  CHIEF_COMPLAINT_MAX_LENGTH,
} from '../value-objects/anamnesis-section.js';
import { AnamnesisStatus } from '../value-objects/anamnesis-status.js';
import { ClinicalTextSection } from '../value-objects/clinical-text-section.js';
import { DefaultAnamnesisCompletionPolicy } from './anamnesis-completion-policy.js';

const NOW = new Date('2026-07-17T10:00:00.000Z');

const TENANT_ID = '550e8400-e29b-41d4-a716-446655440001';
const PATIENT_ID = '550e8400-e29b-41d4-a716-446655440020';
const NUTRITIONIST_ID = '550e8400-e29b-41d4-a716-446655440030';
const ENCOUNTER_ID = '550e8400-e29b-41d4-a716-446655440050';
const ANAMNESIS_ID = '550e8400-e29b-41d4-a716-446655440060';

function reconstituteAnamnesis(overrides?: {
  chiefComplaint?: ClinicalTextSection;
}) {
  return Anamnesis.reconstitute({
    id: AnamnesisId.create(ANAMNESIS_ID),
    tenantId: TENANT_ID,
    clinicalEncounterId: ENCOUNTER_ID,
    patientId: PATIENT_ID,
    nutritionistId: NUTRITIONIST_ID,
    status: AnamnesisStatus.Draft,
    version: 1,
    chiefComplaint:
      overrides?.chiefComplaint ??
      ClinicalTextSection.empty(CHIEF_COMPLAINT_MAX_LENGTH),
    currentHistory: ClinicalTextSection.empty(ANAMNESIS_SECTION_MAX_LENGTH),
    medicalHistory: ClinicalTextSection.empty(ANAMNESIS_SECTION_MAX_LENGTH),
    familyHistory: ClinicalTextSection.empty(ANAMNESIS_SECTION_MAX_LENGTH),
    gastrointestinalHistory: ClinicalTextSection.empty(ANAMNESIS_SECTION_MAX_LENGTH),
    dietaryHistory: ClinicalTextSection.empty(ANAMNESIS_SECTION_MAX_LENGTH),
    lifestyleHistory: ClinicalTextSection.empty(ANAMNESIS_SECTION_MAX_LENGTH),
    medicationHistory: ClinicalTextSection.empty(ANAMNESIS_SECTION_MAX_LENGTH),
    supplementHistory: ClinicalTextSection.empty(ANAMNESIS_SECTION_MAX_LENGTH),
    allergiesAndIntolerances: ClinicalTextSection.empty(ANAMNESIS_SECTION_MAX_LENGTH),
    observations: ClinicalTextSection.empty(ANAMNESIS_SECTION_MAX_LENGTH),
    completedAt: null,
    createdAt: NOW,
    updatedAt: NOW,
  });
}

describe('DefaultAnamnesisCompletionPolicy', () => {
  const policy = new DefaultAnamnesisCompletionPolicy();

  it('passes when chief complaint is present', () => {
    const anamnesis = reconstituteAnamnesis({
      chiefComplaint: ClinicalTextSection.create(
        'Patient reports nausea.',
        CHIEF_COMPLAINT_MAX_LENGTH,
      ),
    });

    assert.doesNotThrow(() => policy.validate(anamnesis));
  });

  it('throws AnamnesisIncompleteDomainError when chief complaint is empty', () => {
    const anamnesis = reconstituteAnamnesis();

    assert.throws(() => policy.validate(anamnesis), AnamnesisIncompleteDomainError);
  });

  it('does not require optional history sections in v1', () => {
    const anamnesis = reconstituteAnamnesis({
      chiefComplaint: ClinicalTextSection.create(
        'Chief complaint only',
        CHIEF_COMPLAINT_MAX_LENGTH,
      ),
    });

    assert.doesNotThrow(() => policy.validate(anamnesis));
  });
});
