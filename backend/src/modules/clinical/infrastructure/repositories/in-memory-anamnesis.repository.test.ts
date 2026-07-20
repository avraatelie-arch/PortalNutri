import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { Anamnesis } from '../../domain/aggregates/anamnesis.aggregate.js';
import { AnamnesisId } from '../../domain/value-objects/anamnesis-id.js';
import {
  ANAMNESIS_SECTION_MAX_LENGTH,
  CHIEF_COMPLAINT_MAX_LENGTH,
} from '../../domain/value-objects/anamnesis-section.js';
import { AnamnesisStatus } from '../../domain/value-objects/anamnesis-status.js';
import { ClinicalTextSection } from '../../domain/value-objects/clinical-text-section.js';
import { InMemoryAnamnesisRepository } from './in-memory-anamnesis.repository.js';

const NOW = new Date('2026-07-17T10:00:00.000Z');

const TENANT_ID = '550e8400-e29b-41d4-a716-446655440001';
const OTHER_TENANT_ID = '550e8400-e29b-41d4-a716-446655440099';
const PATIENT_ID = '550e8400-e29b-41d4-a716-446655440020';
const OTHER_PATIENT_ID = '550e8400-e29b-41d4-a716-446655440021';
const NUTRITIONIST_ID = '550e8400-e29b-41d4-a716-446655440030';
const OTHER_NUTRITIONIST_ID = '550e8400-e29b-41d4-a716-446655440031';
const ENCOUNTER_ID = '550e8400-e29b-41d4-a716-446655440050';
const OTHER_ENCOUNTER_ID = '550e8400-e29b-41d4-a716-446655440051';
const ANAMNESIS_ID = '550e8400-e29b-41d4-a716-446655440060';
const OTHER_ANAMNESIS_ID = '550e8400-e29b-41d4-a716-446655440061';

function createAnamnesis(params: {
  id: string;
  tenantId?: string;
  clinicalEncounterId?: string;
  patientId?: string;
  nutritionistId?: string;
}) {
  return Anamnesis.reconstitute({
    id: AnamnesisId.create(params.id),
    tenantId: params.tenantId ?? TENANT_ID,
    clinicalEncounterId: params.clinicalEncounterId ?? ENCOUNTER_ID,
    patientId: params.patientId ?? PATIENT_ID,
    nutritionistId: params.nutritionistId ?? NUTRITIONIST_ID,
    status: AnamnesisStatus.Draft,
    version: 1,
    chiefComplaint: ClinicalTextSection.empty(CHIEF_COMPLAINT_MAX_LENGTH),
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

describe('InMemoryAnamnesisRepository', () => {
  it('finds anamnesis by tenant and id', async () => {
    const repository = new InMemoryAnamnesisRepository();
    const anamnesis = createAnamnesis({ id: ANAMNESIS_ID });
    await repository.save(anamnesis);

    const found = await repository.findByTenantAndId(
      TENANT_ID,
      AnamnesisId.create(ANAMNESIS_ID),
    );

    assert.ok(found);
    assert.equal(found.getId().toString(), ANAMNESIS_ID);
    assert.equal(found.getTenantId(), TENANT_ID);
  });

  it('returns null for wrong tenant in findByTenantAndId', async () => {
    const repository = new InMemoryAnamnesisRepository();
    await repository.save(createAnamnesis({ id: ANAMNESIS_ID }));

    const found = await repository.findByTenantAndId(
      OTHER_TENANT_ID,
      AnamnesisId.create(ANAMNESIS_ID),
    );

    assert.equal(found, null);
  });

  it('reports existence by clinical encounter', async () => {
    const repository = new InMemoryAnamnesisRepository();
    await repository.save(createAnamnesis({ id: ANAMNESIS_ID }));

    assert.equal(await repository.existsByClinicalEncounter(TENANT_ID, ENCOUNTER_ID), true);
    assert.equal(
      await repository.existsByClinicalEncounter(TENANT_ID, OTHER_ENCOUNTER_ID),
      false,
    );
    assert.equal(
      await repository.existsByClinicalEncounter(OTHER_TENANT_ID, ENCOUNTER_ID),
      false,
    );
  });

  it('finds anamnesis by clinical encounter', async () => {
    const repository = new InMemoryAnamnesisRepository();
    await repository.save(createAnamnesis({ id: ANAMNESIS_ID }));

    const found = await repository.findByClinicalEncounter(TENANT_ID, ENCOUNTER_ID);

    assert.ok(found);
    assert.equal(found.getClinicalEncounterId(), ENCOUNTER_ID);
  });

  it('finds anamneses by patient', async () => {
    const repository = new InMemoryAnamnesisRepository();
    await repository.save(createAnamnesis({ id: ANAMNESIS_ID, patientId: PATIENT_ID }));
    await repository.save(
      createAnamnesis({
        id: OTHER_ANAMNESIS_ID,
        clinicalEncounterId: OTHER_ENCOUNTER_ID,
        patientId: OTHER_PATIENT_ID,
      }),
    );

    const found = await repository.findByPatient(TENANT_ID, PATIENT_ID);

    assert.equal(found.length, 1);
    assert.equal(found[0]?.getPatientId(), PATIENT_ID);
  });

  it('finds anamneses by nutritionist', async () => {
    const repository = new InMemoryAnamnesisRepository();
    await repository.save(
      createAnamnesis({ id: ANAMNESIS_ID, nutritionistId: NUTRITIONIST_ID }),
    );
    await repository.save(
      createAnamnesis({
        id: OTHER_ANAMNESIS_ID,
        clinicalEncounterId: OTHER_ENCOUNTER_ID,
        nutritionistId: OTHER_NUTRITIONIST_ID,
      }),
    );

    const found = await repository.findByNutritionist(TENANT_ID, NUTRITIONIST_ID);

    assert.equal(found.length, 1);
    assert.equal(found[0]?.getNutritionistId(), NUTRITIONIST_ID);
  });
});
