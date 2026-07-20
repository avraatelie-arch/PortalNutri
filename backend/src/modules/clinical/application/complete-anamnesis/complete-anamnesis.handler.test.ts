import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { CapturingEventDispatcher } from '../../../../test-support/capturing-event-dispatcher.js';
import { FixedClock } from '../../../../test-support/fixed-clock.js';
import { noopEventDispatcher } from '../../../../test-support/noop-event-dispatcher.js';
import { Anamnesis } from '../../domain/aggregates/anamnesis.aggregate.js';
import { DefaultAnamnesisCompletionPolicy } from '../../domain/policies/anamnesis-completion-policy.js';
import { AnamnesisId } from '../../domain/value-objects/anamnesis-id.js';
import {
  ANAMNESIS_SECTION_MAX_LENGTH,
  CHIEF_COMPLAINT_MAX_LENGTH,
} from '../../domain/value-objects/anamnesis-section.js';
import { AnamnesisStatus } from '../../domain/value-objects/anamnesis-status.js';
import { ClinicalTextSection } from '../../domain/value-objects/clinical-text-section.js';
import { InMemoryAnamnesisRepository } from '../../infrastructure/repositories/in-memory-anamnesis.repository.js';
import { AnamnesisIncompleteError } from '../errors/anamnesis-incomplete.error.js';
import { AnamnesisNotFoundError } from '../errors/anamnesis-not-found.error.js';
import { CompleteAnamnesisCommand } from './complete-anamnesis.command.js';
import { CompleteAnamnesisHandler } from './complete-anamnesis.handler.js';

const NOW = new Date('2026-07-17T10:00:00.000Z');
const LATER = new Date('2026-07-17T11:00:00.000Z');

const TENANT_ID = '550e8400-e29b-41d4-a716-446655440001';
const OTHER_TENANT_ID = '550e8400-e29b-41d4-a716-446655440099';
const PATIENT_ID = '550e8400-e29b-41d4-a716-446655440020';
const NUTRITIONIST_ID = '550e8400-e29b-41d4-a716-446655440030';
const ENCOUNTER_ID = '550e8400-e29b-41d4-a716-446655440050';
const ANAMNESIS_ID = '550e8400-e29b-41d4-a716-446655440060';

async function seedAnamnesis(
  repository: InMemoryAnamnesisRepository,
  options?: {
    chiefComplaint?: string | null;
    status?: AnamnesisStatus;
    completedAt?: Date | null;
    version?: number;
  },
) {
  const anamnesis = Anamnesis.reconstitute({
    id: AnamnesisId.create(ANAMNESIS_ID),
    tenantId: TENANT_ID,
    clinicalEncounterId: ENCOUNTER_ID,
    patientId: PATIENT_ID,
    nutritionistId: NUTRITIONIST_ID,
    status: options?.status ?? AnamnesisStatus.Draft,
    version: options?.version ?? 1,
    chiefComplaint: ClinicalTextSection.create(
      options?.chiefComplaint ?? null,
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
    completedAt: options?.completedAt ?? null,
    createdAt: NOW,
    updatedAt: NOW,
  });

  await repository.save(anamnesis);
  return anamnesis;
}

function createHandler(
  repository: InMemoryAnamnesisRepository,
  eventDispatcher = noopEventDispatcher,
) {
  return new CompleteAnamnesisHandler(
    repository,
    new DefaultAnamnesisCompletionPolicy(),
    new FixedClock(LATER),
    eventDispatcher,
  );
}

describe('CompleteAnamnesisHandler', () => {
  it('completes anamnesis when chief complaint is present', async () => {
    const repository = new InMemoryAnamnesisRepository();
    await seedAnamnesis(repository, { chiefComplaint: 'Patient reports nausea.' });
    const handler = createHandler(repository);

    const result = await handler.execute(
      new CompleteAnamnesisCommand({
        tenantId: TENANT_ID,
        anamnesisId: ANAMNESIS_ID,
      }),
    );

    assert.equal(result.status, AnamnesisStatus.Completed);
    assert.equal(result.completedAt, LATER.toISOString());
    assert.equal(result.version, 2);
    assert.equal(result.updatedAt, LATER.toISOString());
  });

  it('rejects completion when chief complaint is missing', async () => {
    const repository = new InMemoryAnamnesisRepository();
    await seedAnamnesis(repository);
    const handler = createHandler(repository);

    await assert.rejects(
      () =>
        handler.execute(
          new CompleteAnamnesisCommand({
            tenantId: TENANT_ID,
            anamnesisId: ANAMNESIS_ID,
          }),
        ),
      AnamnesisIncompleteError,
    );
  });

  it('is idempotent when anamnesis is already completed', async () => {
    const repository = new InMemoryAnamnesisRepository();
    await seedAnamnesis(repository, {
      chiefComplaint: 'Chief complaint',
      status: AnamnesisStatus.Completed,
      completedAt: LATER,
      version: 2,
    });
    const eventDispatcher = new CapturingEventDispatcher();
    const handler = createHandler(repository, eventDispatcher);

    const result = await handler.execute(
      new CompleteAnamnesisCommand({
        tenantId: TENANT_ID,
        anamnesisId: ANAMNESIS_ID,
      }),
    );

    assert.equal(result.status, AnamnesisStatus.Completed);
    assert.equal(result.version, 2);
    assert.equal(eventDispatcher.dispatched.length, 0);
  });

  it('dispatches AnamnesisCompleted after persistence', async () => {
    const repository = new InMemoryAnamnesisRepository();
    await seedAnamnesis(repository, { chiefComplaint: 'Chief complaint' });
    const eventDispatcher = new CapturingEventDispatcher();
    const handler = createHandler(repository, eventDispatcher);

    await handler.execute(
      new CompleteAnamnesisCommand({
        tenantId: TENANT_ID,
        anamnesisId: ANAMNESIS_ID,
      }),
    );

    assert.equal(eventDispatcher.dispatched.length, 1);
    assert.equal(
      (eventDispatcher.dispatched[0]?.[0] as { eventName: string }).eventName,
      'AnamnesisCompleted',
    );
  });

  it('throws AnamnesisNotFoundError for wrong tenant', async () => {
    const repository = new InMemoryAnamnesisRepository();
    await seedAnamnesis(repository, { chiefComplaint: 'Chief complaint' });
    const handler = createHandler(repository);

    await assert.rejects(
      () =>
        handler.execute(
          new CompleteAnamnesisCommand({
            tenantId: OTHER_TENANT_ID,
            anamnesisId: ANAMNESIS_ID,
          }),
        ),
      AnamnesisNotFoundError,
    );
  });
});
