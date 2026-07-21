import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { ClinicalObjective } from '../../domain/aggregates/clinical-objective.aggregate.js';
import { ClinicalObjectiveId } from '../../domain/value-objects/clinical-objective-id.js';
import { ClinicalObjectivePriorityValue } from '../../domain/value-objects/clinical-objective-priority.js';
import { ClinicalObjectiveStatusValue } from '../../domain/value-objects/clinical-objective-status.js';
import { ClinicalObjectiveTitle } from '../../domain/value-objects/clinical-objective-title.js';
import { ClinicalObjectiveType } from '../../domain/value-objects/clinical-objective-type.js';
import { ClinicalRationale } from '../../domain/value-objects/clinical-rationale.js';
import { SuccessCriteria } from '../../domain/value-objects/success-criteria.js';
import { InMemoryClinicalObjectiveRepository } from '../../infrastructure/repositories/in-memory-clinical-objective.repository.js';
import { ClinicalObjectiveNotFoundError } from '../errors/clinical-objective-not-found.error.js';
import { FindClinicalObjectiveQuery } from './find-clinical-objective.query.js';
import { FindClinicalObjectiveHandler } from './find-clinical-objective.handler.js';

const NOW = new Date('2026-07-20T10:00:00.000Z');
const NEXT_DAY = new Date('2026-07-21T10:00:00.000Z');
const TENANT_ID = '550e8400-e29b-41d4-a716-446655440001';
const OTHER_TENANT_ID = '550e8400-e29b-41d4-a716-446655440099';
const PATIENT_ID = '550e8400-e29b-41d4-a716-446655440020';
const OBJECTIVE_ID = '550e8400-e29b-41d4-a716-446655440070';

async function seedObjective(repository, params) {
  const objective = ClinicalObjective.reconstitute({
    id: ClinicalObjectiveId.create(OBJECTIVE_ID),
    tenantId: TENANT_ID,
    patientId: PATIENT_ID,
    createdByNutritionistId: '550e8400-e29b-41d4-a716-446655440030',
    responsibleNutritionistId: '550e8400-e29b-41d4-a716-446655440031',
    originClinicalEncounterId: null,
    originAnamnesisId: null,
    type: ClinicalObjectiveType.parse('WEIGHT_LOSS'),
    status: params.status,
    priority: params.priority ?? ClinicalObjectivePriorityValue.Medium,
    version: 1,
    title: ClinicalObjectiveTitle.create('Stored title'),
    clinicalRationale: ClinicalRationale.empty(),
    successCriteria: SuccessCriteria.empty(),
    targetDate: NEXT_DAY,
    activatedAt: params.activatedAt ?? null,
    pausedAt: null,
    completedAt: null,
    cancelledAt: null,
    createdAt: NOW,
    updatedAt: NOW,
  });
  await repository.save(objective);
}

describe('FindClinicalObjectiveHandler', () => {
  it('finds objective scoped to tenant', async () => {
    const repository = new InMemoryClinicalObjectiveRepository();
    await seedObjective(repository, { status: ClinicalObjectiveStatusValue.Draft });
    const handler = new FindClinicalObjectiveHandler(repository);

    const found = await handler.execute(
      new FindClinicalObjectiveQuery({
        tenantId: TENANT_ID,
        clinicalObjectiveId: OBJECTIVE_ID,
      }),
    );

    assert.equal(found.id, OBJECTIVE_ID);
    assert.equal(found.title, 'Stored title');
  });

  it('throws for wrong tenant', async () => {
    const repository = new InMemoryClinicalObjectiveRepository();
    await seedObjective(repository, { status: ClinicalObjectiveStatusValue.Draft });
    const handler = new FindClinicalObjectiveHandler(repository);

    await assert.rejects(
      () =>
        handler.execute(
          new FindClinicalObjectiveQuery({
            tenantId: OTHER_TENANT_ID,
            clinicalObjectiveId: OBJECTIVE_ID,
          }),
        ),
      ClinicalObjectiveNotFoundError,
    );
  });
});
