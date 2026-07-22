import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { FixedClock } from '../../../../test-support/fixed-clock.js';
import { noopEventDispatcher } from '../../../../test-support/noop-event-dispatcher.js';
import { ClinicalEvolution } from '../../domain/aggregates/clinical-evolution.aggregate.js';
import { DefaultEvolutionFinalizationPolicy } from '../../domain/policies/evolution-finalization-policy.js';
import { ClinicalEvolutionId } from '../../domain/value-objects/clinical-evolution-id.js';
import {
  ClinicalEvolutionSection,
  ClinicalEvolutionSectionValue,
} from '../../domain/value-objects/clinical-evolution-section.js';
import { ClinicalEvolutionStatusValue } from '../../domain/value-objects/clinical-evolution-status.js';
import {
  NextClinicalConsiderations,
  SubjectiveEvolution,
} from '../../domain/value-objects/clinical-evolution-text-sections.js';
import { InMemoryClinicalEncounterDirectory } from '../../infrastructure/adapters/in-memory-clinical-encounter-directory.js';
import { InMemoryClinicalEvolutionRepository } from '../../infrastructure/repositories/in-memory-clinical-evolution.repository.js';
import { ClinicalEncounterCancelledForClinicalEvolutionError } from '../errors/clinical-encounter-cancelled-for-clinical-evolution.error.js';
import { ClinicalEvolutionFinalizationRequirementsNotMetError } from '../errors/clinical-evolution-finalization-requirements-not-met.error.js';
import { FinalizeClinicalEvolutionCommand } from './finalize-clinical-evolution.command.js';
import { FinalizeClinicalEvolutionHandler } from './finalize-clinical-evolution.handler.js';

const NOW = new Date('2026-07-20T10:00:00.000Z');
const LATER = new Date('2026-07-20T11:00:00.000Z');
const CLINICAL_MOMENT_AT = new Date('2026-07-20T09:30:00.000Z');

const TENANT_ID = '550e8400-e29b-41d4-a716-446655440001';
const PATIENT_ID = '550e8400-e29b-41d4-a716-446655440020';
const CREATED_BY_ID = '550e8400-e29b-41d4-a716-446655440030';
const RESPONSIBLE_ID = '550e8400-e29b-41d4-a716-446655440031';
const ENCOUNTER_ID = '550e8400-e29b-41d4-a716-446655440050';
const EVOLUTION_ID = '550e8400-e29b-41d4-a716-446655440070';

const policy = new DefaultEvolutionFinalizationPolicy();

async function seedDraftEvolution(repository: InMemoryClinicalEvolutionRepository) {
  const evolution = ClinicalEvolution.create({
    id: ClinicalEvolutionId.create(EVOLUTION_ID),
    tenantId: TENANT_ID,
    clinicalEncounterId: ENCOUNTER_ID,
    patientId: PATIENT_ID,
    createdByNutritionistId: CREATED_BY_ID,
    responsibleNutritionistId: RESPONSIBLE_ID,
    clinicalMomentAt: CLINICAL_MOMENT_AT,
    now: NOW,
  });
  evolution.clearDomainEvents();
  await repository.save(evolution);
  return evolution;
}

function fillFinalizationRequirements(evolution: ClinicalEvolution): void {
  evolution.updateSection(
    ClinicalEvolutionSection.fromValue(ClinicalEvolutionSectionValue.SubjectiveEvolution),
    SubjectiveEvolution.create('Patient reports improved energy.'),
    LATER,
  );
  evolution.updateSection(
    ClinicalEvolutionSection.fromValue(
      ClinicalEvolutionSectionValue.NextClinicalConsiderations,
    ),
    NextClinicalConsiderations.create('Continue current plan.'),
    LATER,
  );
}

function seedEncounterDirectory(status: 'OPEN' | 'FINISHED' | 'CANCELLED') {
  const directory = new InMemoryClinicalEncounterDirectory();
  directory.seed({
    id: ENCOUNTER_ID,
    tenantId: TENANT_ID,
    patientId: PATIENT_ID,
    nutritionistId: RESPONSIBLE_ID,
    status,
  });
  return directory;
}

describe('FinalizeClinicalEvolutionHandler', () => {
  it('finalizes draft evolution when requirements are met', async () => {
    const repository = new InMemoryClinicalEvolutionRepository();
    const evolution = await seedDraftEvolution(repository);
    fillFinalizationRequirements(evolution);
    evolution.clearDomainEvents();
    await repository.save(evolution);

    const handler = new FinalizeClinicalEvolutionHandler(
      repository,
      seedEncounterDirectory('OPEN'),
      policy,
      new FixedClock(LATER),
      noopEventDispatcher,
    );

    const result = await handler.execute(
      new FinalizeClinicalEvolutionCommand({
        tenantId: TENANT_ID,
        clinicalEvolutionId: EVOLUTION_ID,
      }),
    );

    assert.equal(result.status, ClinicalEvolutionStatusValue.Finalized);
    assert.equal(result.finalizedAt, LATER.toISOString());
  });

  it('rejects finalization when encounter is cancelled', async () => {
    const repository = new InMemoryClinicalEvolutionRepository();
    const evolution = await seedDraftEvolution(repository);
    fillFinalizationRequirements(evolution);
    evolution.clearDomainEvents();
    await repository.save(evolution);

    const handler = new FinalizeClinicalEvolutionHandler(
      repository,
      seedEncounterDirectory('CANCELLED'),
      policy,
      new FixedClock(LATER),
      noopEventDispatcher,
    );

    await assert.rejects(
      () =>
        handler.execute(
          new FinalizeClinicalEvolutionCommand({
            tenantId: TENANT_ID,
            clinicalEvolutionId: EVOLUTION_ID,
          }),
        ),
      ClinicalEncounterCancelledForClinicalEvolutionError,
    );
  });

  it('rejects finalization when requirements are not met', async () => {
    const repository = new InMemoryClinicalEvolutionRepository();
    await seedDraftEvolution(repository);

    const handler = new FinalizeClinicalEvolutionHandler(
      repository,
      seedEncounterDirectory('OPEN'),
      policy,
      new FixedClock(LATER),
      noopEventDispatcher,
    );

    await assert.rejects(
      () =>
        handler.execute(
          new FinalizeClinicalEvolutionCommand({
            tenantId: TENANT_ID,
            clinicalEvolutionId: EVOLUTION_ID,
          }),
        ),
      ClinicalEvolutionFinalizationRequirementsNotMetError,
    );
  });
});
