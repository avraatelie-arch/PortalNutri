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
import { InMemoryAnamnesisRepository } from '../../infrastructure/repositories/in-memory-anamnesis.repository.js';
import { AnamnesisNotFoundError } from '../errors/anamnesis-not-found.error.js';
import { FindAnamnesisByClinicalEncounterHandler } from './find-anamnesis-by-clinical-encounter.handler.js';
import { FindAnamnesisByClinicalEncounterQuery } from './find-anamnesis-by-clinical-encounter.query.js';

const NOW = new Date('2026-07-17T10:00:00.000Z');

const TENANT_ID = '550e8400-e29b-41d4-a716-446655440001';
const OTHER_TENANT_ID = '550e8400-e29b-41d4-a716-446655440099';
const PATIENT_ID = '550e8400-e29b-41d4-a716-446655440020';
const NUTRITIONIST_ID = '550e8400-e29b-41d4-a716-446655440030';
const ENCOUNTER_ID = '550e8400-e29b-41d4-a716-446655440050';
const OTHER_ENCOUNTER_ID = '550e8400-e29b-41d4-a716-446655440051';
const ANAMNESIS_ID = '550e8400-e29b-41d4-a716-446655440060';

async function seedAnamnesis(
  repository: InMemoryAnamnesisRepository,
  overrides?: {
    tenantId?: string;
    clinicalEncounterId?: string;
  },
) {
  const anamnesis = Anamnesis.reconstitute({
    id: AnamnesisId.create(ANAMNESIS_ID),
    tenantId: overrides?.tenantId ?? TENANT_ID,
    clinicalEncounterId: overrides?.clinicalEncounterId ?? ENCOUNTER_ID,
    patientId: PATIENT_ID,
    nutritionistId: NUTRITIONIST_ID,
    status: AnamnesisStatus.Draft,
    version: 1,
    chiefComplaint: ClinicalTextSection.create(
      'Encounter-linked complaint',
      CHIEF_COMPLAINT_MAX_LENGTH,
    ),
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

  await repository.save(anamnesis);
  return anamnesis;
}

describe('FindAnamnesisByClinicalEncounterHandler', () => {
  it('finds anamnesis by clinical encounter scoped to tenant', async () => {
    const repository = new InMemoryAnamnesisRepository();
    await seedAnamnesis(repository);
    const handler = new FindAnamnesisByClinicalEncounterHandler(repository);

    const found = await handler.execute(
      new FindAnamnesisByClinicalEncounterQuery({
        tenantId: TENANT_ID,
        clinicalEncounterId: ENCOUNTER_ID,
      }),
    );

    assert.equal(found.id, ANAMNESIS_ID);
    assert.equal(found.clinicalEncounterId, ENCOUNTER_ID);
    assert.equal(found.chiefComplaint, 'Encounter-linked complaint');
    assert.equal(found.tenantId, TENANT_ID);
  });

  it('throws AnamnesisNotFoundError when encounter has no anamnesis', async () => {
    const repository = new InMemoryAnamnesisRepository();
    await seedAnamnesis(repository);
    const handler = new FindAnamnesisByClinicalEncounterHandler(repository);

    await assert.rejects(
      () =>
        handler.execute(
          new FindAnamnesisByClinicalEncounterQuery({
            tenantId: TENANT_ID,
            clinicalEncounterId: OTHER_ENCOUNTER_ID,
          }),
        ),
      AnamnesisNotFoundError,
    );
  });

  it('throws AnamnesisNotFoundError for wrong tenant', async () => {
    const repository = new InMemoryAnamnesisRepository();
    await seedAnamnesis(repository);
    const handler = new FindAnamnesisByClinicalEncounterHandler(repository);

    await assert.rejects(
      () =>
        handler.execute(
          new FindAnamnesisByClinicalEncounterQuery({
            tenantId: OTHER_TENANT_ID,
            clinicalEncounterId: ENCOUNTER_ID,
          }),
        ),
      AnamnesisNotFoundError,
    );
  });
});
