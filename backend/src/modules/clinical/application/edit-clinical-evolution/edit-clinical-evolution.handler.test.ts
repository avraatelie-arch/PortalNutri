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
import { InMemoryClinicalEvolutionRepository } from '../../infrastructure/repositories/in-memory-clinical-evolution.repository.js';
import { ClinicalEvolutionNotDraftError } from '../errors/clinical-evolution-not-draft.error.js';
import { EditClinicalEvolutionCommand } from './edit-clinical-evolution.command.js';
import { EditClinicalEvolutionHandler } from './edit-clinical-evolution.handler.js';

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

describe('EditClinicalEvolutionHandler', () => {
  it('edits optional section fields on draft evolution', async () => {
    const repository = new InMemoryClinicalEvolutionRepository();
    await seedDraftEvolution(repository);

    const handler = new EditClinicalEvolutionHandler(
      repository,
      new FixedClock(LATER),
      noopEventDispatcher,
    );

    const result = await handler.execute(
      new EditClinicalEvolutionCommand({
        tenantId: TENANT_ID,
        clinicalEvolutionId: EVOLUTION_ID,
        subjectiveEvolution: 'Patient reports improved energy.',
        nextClinicalConsiderations: 'Continue current plan.',
      }),
    );

    assert.equal(result.subjectiveEvolution, 'Patient reports improved energy.');
    assert.equal(result.nextClinicalConsiderations, 'Continue current plan.');
    assert.equal(result.version, 3);
  });

  it('does not bump version when section content is unchanged', async () => {
    const repository = new InMemoryClinicalEvolutionRepository();
    await seedDraftEvolution(repository);

    const handler = new EditClinicalEvolutionHandler(
      repository,
      new FixedClock(LATER),
      noopEventDispatcher,
    );

    await handler.execute(
      new EditClinicalEvolutionCommand({
        tenantId: TENANT_ID,
        clinicalEvolutionId: EVOLUTION_ID,
        subjectiveEvolution: 'Initial note.',
      }),
    );

    const result = await handler.execute(
      new EditClinicalEvolutionCommand({
        tenantId: TENANT_ID,
        clinicalEvolutionId: EVOLUTION_ID,
        subjectiveEvolution: 'Initial note.',
      }),
    );

    assert.equal(result.subjectiveEvolution, 'Initial note.');
    assert.equal(result.version, 2);
  });

  it('rejects editing a finalized evolution', async () => {
    const repository = new InMemoryClinicalEvolutionRepository();
    const evolution = await seedDraftEvolution(repository);
    fillFinalizationRequirements(evolution);
    evolution.finalize(LATER, policy);
    evolution.clearDomainEvents();
    await repository.save(evolution);

    const handler = new EditClinicalEvolutionHandler(
      repository,
      new FixedClock(LATER),
      noopEventDispatcher,
    );

    await assert.rejects(
      () =>
        handler.execute(
          new EditClinicalEvolutionCommand({
            tenantId: TENANT_ID,
            clinicalEvolutionId: EVOLUTION_ID,
            subjectiveEvolution: 'Should fail.',
          }),
        ),
      ClinicalEvolutionNotDraftError,
    );
  });
});
