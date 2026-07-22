import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { FixedClock } from '../../../../test-support/fixed-clock.js';
import { noopEventDispatcher } from '../../../../test-support/noop-event-dispatcher.js';
import { ClinicalEvolution } from '../../domain/aggregates/clinical-evolution.aggregate.js';
import { ClinicalEvolutionId } from '../../domain/value-objects/clinical-evolution-id.js';
import { ClinicalEvolutionStatusValue } from '../../domain/value-objects/clinical-evolution-status.js';
import { InMemoryClinicalEvolutionRepository } from '../../infrastructure/repositories/in-memory-clinical-evolution.repository.js';
import { ClinicalEvolutionAlreadyTerminalError } from '../errors/clinical-evolution-already-terminal.error.js';
import { CancelClinicalEvolutionCommand } from './cancel-clinical-evolution.command.js';
import { CancelClinicalEvolutionHandler } from './cancel-clinical-evolution.handler.js';

const NOW = new Date('2026-07-20T10:00:00.000Z');
const LATER = new Date('2026-07-20T11:00:00.000Z');
const CLINICAL_MOMENT_AT = new Date('2026-07-20T09:30:00.000Z');

const TENANT_ID = '550e8400-e29b-41d4-a716-446655440001';
const PATIENT_ID = '550e8400-e29b-41d4-a716-446655440020';
const CREATED_BY_ID = '550e8400-e29b-41d4-a716-446655440030';
const RESPONSIBLE_ID = '550e8400-e29b-41d4-a716-446655440031';
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

describe('CancelClinicalEvolutionHandler', () => {
  it('cancels draft clinical evolution', async () => {
    const repository = new InMemoryClinicalEvolutionRepository();
    await seedDraftEvolution(repository);

    const handler = new CancelClinicalEvolutionHandler(
      repository,
      new FixedClock(LATER),
      noopEventDispatcher,
    );

    const result = await handler.execute(
      new CancelClinicalEvolutionCommand({
        tenantId: TENANT_ID,
        clinicalEvolutionId: EVOLUTION_ID,
      }),
    );

    assert.equal(result.status, ClinicalEvolutionStatusValue.Cancelled);
    assert.equal(result.cancelledAt, LATER.toISOString());
  });

  it('rejects cancelling an already cancelled evolution', async () => {
    const repository = new InMemoryClinicalEvolutionRepository();
    const evolution = await seedDraftEvolution(repository);
    evolution.cancel(LATER);
    evolution.clearDomainEvents();
    await repository.save(evolution);

    const handler = new CancelClinicalEvolutionHandler(
      repository,
      new FixedClock(LATER),
      noopEventDispatcher,
    );

    await assert.rejects(
      () =>
        handler.execute(
          new CancelClinicalEvolutionCommand({
            tenantId: TENANT_ID,
            clinicalEvolutionId: EVOLUTION_ID,
          }),
        ),
      ClinicalEvolutionAlreadyTerminalError,
    );
  });
});
