import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { CapturingEventDispatcher } from '../../../../test-support/capturing-event-dispatcher.js';
import { FixedClock } from '../../../../test-support/fixed-clock.js';
import { noopEventDispatcher } from '../../../../test-support/noop-event-dispatcher.js';
import { Anamnesis } from '../../domain/aggregates/anamnesis.aggregate.js';
import { AnamnesisId } from '../../domain/value-objects/anamnesis-id.js';
import {
  AnamnesisSectionValue,
  ANAMNESIS_SECTION_MAX_LENGTH,
  CHIEF_COMPLAINT_MAX_LENGTH,
} from '../../domain/value-objects/anamnesis-section.js';
import { AnamnesisStatus } from '../../domain/value-objects/anamnesis-status.js';
import { ClinicalTextSection } from '../../domain/value-objects/clinical-text-section.js';
import { InMemoryAnamnesisRepository } from '../../infrastructure/repositories/in-memory-anamnesis.repository.js';
import { AnamnesisAlreadyCompletedError } from '../errors/anamnesis-already-completed.error.js';
import { AnamnesisNotFoundError } from '../errors/anamnesis-not-found.error.js';
import { InvalidAnamnesisSectionError } from '../errors/invalid-anamnesis-section.error.js';
import { UpdateAnamnesisSectionCommand } from './update-anamnesis-section.command.js';
import { UpdateAnamnesisSectionHandler } from './update-anamnesis-section.handler.js';

const NOW = new Date('2026-07-17T10:00:00.000Z');
const LATER = new Date('2026-07-17T11:00:00.000Z');

const TENANT_ID = '550e8400-e29b-41d4-a716-446655440001';
const OTHER_TENANT_ID = '550e8400-e29b-41d4-a716-446655440099';
const PATIENT_ID = '550e8400-e29b-41d4-a716-446655440020';
const NUTRITIONIST_ID = '550e8400-e29b-41d4-a716-446655440030';
const ENCOUNTER_ID = '550e8400-e29b-41d4-a716-446655440050';
const ANAMNESIS_ID = '550e8400-e29b-41d4-a716-446655440060';

async function seedDraftAnamnesis(
  repository: InMemoryAnamnesisRepository,
  overrides?: { tenantId?: string; status?: AnamnesisStatus; completedAt?: Date | null },
) {
  const anamnesis = Anamnesis.reconstitute({
    id: AnamnesisId.create(ANAMNESIS_ID),
    tenantId: overrides?.tenantId ?? TENANT_ID,
    clinicalEncounterId: ENCOUNTER_ID,
    patientId: PATIENT_ID,
    nutritionistId: NUTRITIONIST_ID,
    status: overrides?.status ?? AnamnesisStatus.Draft,
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
    completedAt: overrides?.completedAt ?? null,
    createdAt: NOW,
    updatedAt: NOW,
  });

  await repository.save(anamnesis);
  return anamnesis;
}

describe('UpdateAnamnesisSectionHandler', () => {
  it('updates a section while anamnesis is in DRAFT', async () => {
    const repository = new InMemoryAnamnesisRepository();
    await seedDraftAnamnesis(repository);
    const handler = new UpdateAnamnesisSectionHandler(
      repository,
      new FixedClock(LATER),
      noopEventDispatcher,
    );

    const result = await handler.execute(
      new UpdateAnamnesisSectionCommand({
        tenantId: TENANT_ID,
        anamnesisId: ANAMNESIS_ID,
        section: AnamnesisSectionValue.ChiefComplaint,
        content: '  Patient reports   nausea.  ',
      }),
    );

    assert.equal(result.chiefComplaint, 'Patient reports nausea.');
    assert.equal(result.version, 2);
    assert.equal(result.status, AnamnesisStatus.Draft);
    assert.equal(result.updatedAt, LATER.toISOString());
  });

  it('does not dispatch event when normalized content is unchanged', async () => {
    const repository = new InMemoryAnamnesisRepository();
    await seedDraftAnamnesis(repository);
    const eventDispatcher = new CapturingEventDispatcher();
    const handler = new UpdateAnamnesisSectionHandler(
      repository,
      new FixedClock(LATER),
      eventDispatcher,
    );

    await handler.execute(
      new UpdateAnamnesisSectionCommand({
        tenantId: TENANT_ID,
        anamnesisId: ANAMNESIS_ID,
        section: AnamnesisSectionValue.ChiefComplaint,
        content: 'Initial complaint',
      }),
    );
    eventDispatcher.dispatched.length = 0;

    await handler.execute(
      new UpdateAnamnesisSectionCommand({
        tenantId: TENANT_ID,
        anamnesisId: ANAMNESIS_ID,
        section: AnamnesisSectionValue.ChiefComplaint,
        content: '  Initial   complaint  ',
      }),
    );

    assert.equal(eventDispatcher.dispatched.length, 0);
  });

  it('dispatches AnamnesisSectionUpdated without section text content', async () => {
    const repository = new InMemoryAnamnesisRepository();
    await seedDraftAnamnesis(repository);
    const eventDispatcher = new CapturingEventDispatcher();
    const handler = new UpdateAnamnesisSectionHandler(
      repository,
      new FixedClock(LATER),
      eventDispatcher,
    );

    await handler.execute(
      new UpdateAnamnesisSectionCommand({
        tenantId: TENANT_ID,
        anamnesisId: ANAMNESIS_ID,
        section: AnamnesisSectionValue.CurrentHistory,
        content: 'Detailed history content',
      }),
    );

    assert.equal(eventDispatcher.dispatched.length, 1);
    const event = eventDispatcher.dispatched[0]?.[0] as {
      eventName: string;
      section: string;
    };
    assert.equal(event.eventName, 'AnamnesisSectionUpdated');
    assert.equal(event.section, AnamnesisSectionValue.CurrentHistory);
    assert.doesNotMatch(JSON.stringify(event), /Detailed history content/);
  });

  it('rejects invalid section names', async () => {
    const repository = new InMemoryAnamnesisRepository();
    await seedDraftAnamnesis(repository);
    const handler = new UpdateAnamnesisSectionHandler(
      repository,
      new FixedClock(LATER),
      noopEventDispatcher,
    );

    await assert.rejects(
      () =>
        handler.execute(
          new UpdateAnamnesisSectionCommand({
            tenantId: TENANT_ID,
            anamnesisId: ANAMNESIS_ID,
            section: 'INVALID_SECTION',
            content: 'Value',
          }),
        ),
      InvalidAnamnesisSectionError,
    );
  });

  it('rejects updates on completed anamnesis', async () => {
    const repository = new InMemoryAnamnesisRepository();
    await seedDraftAnamnesis(repository, {
      status: AnamnesisStatus.Completed,
      completedAt: LATER,
    });
    const handler = new UpdateAnamnesisSectionHandler(
      repository,
      new FixedClock(LATER),
      noopEventDispatcher,
    );

    await assert.rejects(
      () =>
        handler.execute(
          new UpdateAnamnesisSectionCommand({
            tenantId: TENANT_ID,
            anamnesisId: ANAMNESIS_ID,
            section: AnamnesisSectionValue.ChiefComplaint,
            content: 'Too late',
          }),
        ),
      AnamnesisAlreadyCompletedError,
    );
  });

  it('throws AnamnesisNotFoundError for wrong tenant', async () => {
    const repository = new InMemoryAnamnesisRepository();
    await seedDraftAnamnesis(repository);
    const handler = new UpdateAnamnesisSectionHandler(
      repository,
      new FixedClock(LATER),
      noopEventDispatcher,
    );

    await assert.rejects(
      () =>
        handler.execute(
          new UpdateAnamnesisSectionCommand({
            tenantId: OTHER_TENANT_ID,
            anamnesisId: ANAMNESIS_ID,
            section: AnamnesisSectionValue.ChiefComplaint,
            content: 'Value',
          }),
        ),
      AnamnesisNotFoundError,
    );
  });

  it('preserves paragraph breaks in section content', async () => {
    const repository = new InMemoryAnamnesisRepository();
    await seedDraftAnamnesis(repository);
    const handler = new UpdateAnamnesisSectionHandler(
      repository,
      new FixedClock(LATER),
      noopEventDispatcher,
    );

    const result = await handler.execute(
      new UpdateAnamnesisSectionCommand({
        tenantId: TENANT_ID,
        anamnesisId: ANAMNESIS_ID,
        section: AnamnesisSectionValue.Observations,
        content: '  Patient reports   nausea.\r\n\r\n  Symptoms worsen at night.  ',
      }),
    );

    assert.equal(
      result.observations,
      'Patient reports nausea.\n\nSymptoms worsen at night.',
    );
  });
});
