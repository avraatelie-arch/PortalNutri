import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { FixedClock } from '../../../../test-support/fixed-clock.js';
import { noopEventDispatcher } from '../../../../test-support/noop-event-dispatcher.js';
import { ClinicalEvolution } from '../../domain/aggregates/clinical-evolution.aggregate.js';
import { ClinicalEvolutionId } from '../../domain/value-objects/clinical-evolution-id.js';
import { InMemoryNutritionistDirectory } from '../../infrastructure/adapters/in-memory-nutritionist-directory.js';
import { InMemoryClinicalEvolutionRepository } from '../../infrastructure/repositories/in-memory-clinical-evolution.repository.js';
import { NutritionistNotFoundForClinicalEvolutionError } from '../errors/nutritionist-not-found-for-clinical-evolution.error.js';
import { ChangeClinicalEvolutionResponsibleNutritionistCommand } from './change-clinical-evolution-responsible-nutritionist.command.js';
import { ChangeClinicalEvolutionResponsibleNutritionistHandler } from './change-clinical-evolution-responsible-nutritionist.handler.js';

const NOW = new Date('2026-07-20T10:00:00.000Z');
const LATER = new Date('2026-07-20T11:00:00.000Z');
const CLINICAL_MOMENT_AT = new Date('2026-07-20T09:30:00.000Z');

const TENANT_ID = '550e8400-e29b-41d4-a716-446655440001';
const PATIENT_ID = '550e8400-e29b-41d4-a716-446655440020';
const CREATED_BY_ID = '550e8400-e29b-41d4-a716-446655440030';
const RESPONSIBLE_ID = '550e8400-e29b-41d4-a716-446655440031';
const NEW_RESPONSIBLE_ID = '550e8400-e29b-41d4-a716-446655440032';
const ENCOUNTER_ID = '550e8400-e29b-41d4-a716-446655440050';
const EVOLUTION_ID = '550e8400-e29b-41d4-a716-446655440070';

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

describe('ChangeClinicalEvolutionResponsibleNutritionistHandler', () => {
  it('changes responsible nutritionist when target is active', async () => {
    const repository = new InMemoryClinicalEvolutionRepository();
    await seedDraftEvolution(repository);

    const nutritionistDirectory = new InMemoryNutritionistDirectory();
    nutritionistDirectory.seed({
      id: NEW_RESPONSIBLE_ID,
      tenantId: TENANT_ID,
      status: 'ACTIVE',
    });

    const handler = new ChangeClinicalEvolutionResponsibleNutritionistHandler(
      repository,
      nutritionistDirectory,
      new FixedClock(LATER),
      noopEventDispatcher,
    );

    const result = await handler.execute(
      new ChangeClinicalEvolutionResponsibleNutritionistCommand({
        tenantId: TENANT_ID,
        clinicalEvolutionId: EVOLUTION_ID,
        responsibleNutritionistId: NEW_RESPONSIBLE_ID,
      }),
    );

    assert.equal(result.responsibleNutritionistId, NEW_RESPONSIBLE_ID);
    assert.equal(result.version, 2);
  });

  it('rejects unknown nutritionist', async () => {
    const repository = new InMemoryClinicalEvolutionRepository();
    await seedDraftEvolution(repository);

    const handler = new ChangeClinicalEvolutionResponsibleNutritionistHandler(
      repository,
      new InMemoryNutritionistDirectory(),
      new FixedClock(LATER),
      noopEventDispatcher,
    );

    await assert.rejects(
      () =>
        handler.execute(
          new ChangeClinicalEvolutionResponsibleNutritionistCommand({
            tenantId: TENANT_ID,
            clinicalEvolutionId: EVOLUTION_ID,
            responsibleNutritionistId: NEW_RESPONSIBLE_ID,
          }),
        ),
      NutritionistNotFoundForClinicalEvolutionError,
    );
  });

  it('does not bump version when responsible nutritionist is unchanged', async () => {
    const repository = new InMemoryClinicalEvolutionRepository();
    await seedDraftEvolution(repository);

    const nutritionistDirectory = new InMemoryNutritionistDirectory();
    nutritionistDirectory.seed({
      id: RESPONSIBLE_ID,
      tenantId: TENANT_ID,
      status: 'ACTIVE',
    });

    const handler = new ChangeClinicalEvolutionResponsibleNutritionistHandler(
      repository,
      nutritionistDirectory,
      new FixedClock(LATER),
      noopEventDispatcher,
    );

    const result = await handler.execute(
      new ChangeClinicalEvolutionResponsibleNutritionistCommand({
        tenantId: TENANT_ID,
        clinicalEvolutionId: EVOLUTION_ID,
        responsibleNutritionistId: RESPONSIBLE_ID,
      }),
    );

    assert.equal(result.responsibleNutritionistId, RESPONSIBLE_ID);
    assert.equal(result.version, 1);
  });
});
