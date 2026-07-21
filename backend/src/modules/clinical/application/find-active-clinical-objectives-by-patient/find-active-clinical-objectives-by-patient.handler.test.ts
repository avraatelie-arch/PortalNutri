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

import { FindActiveClinicalObjectivesByPatientQuery } from './find-active-clinical-objectives-by-patient.query.js';
import { FindActiveClinicalObjectivesByPatientHandler } from './find-active-clinical-objectives-by-patient.handler.js';

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

describe('FindActiveClinicalObjectivesByPatientHandler', () => {
  it('returns only active objectives ordered by priority', async () => {
    const repository = new InMemoryClinicalObjectiveRepository();
    await seedObjective(repository, {
      status: ClinicalObjectiveStatusValue.Active,
      priority: ClinicalObjectivePriorityValue.Low,
      activatedAt: NOW,
    });

    const second = ClinicalObjective.reconstitute({
      id: ClinicalObjectiveId.create('550e8400-e29b-41d4-a716-446655440071'),
      tenantId: TENANT_ID,
      patientId: PATIENT_ID,
      createdByNutritionistId: '550e8400-e29b-41d4-a716-446655440030',
      responsibleNutritionistId: '550e8400-e29b-41d4-a716-446655440031',
      originClinicalEncounterId: null,
      originAnamnesisId: null,
      type: ClinicalObjectiveType.parse('WEIGHT_LOSS'),
      status: ClinicalObjectiveStatusValue.Active,
      priority: ClinicalObjectivePriorityValue.Critical,
      version: 1,
      title: ClinicalObjectiveTitle.create('Critical objective'),
      clinicalRationale: ClinicalRationale.empty(),
      successCriteria: SuccessCriteria.empty(),
      targetDate: NEXT_DAY,
      activatedAt: NOW,
      pausedAt: null,
      completedAt: null,
      cancelledAt: null,
      createdAt: NOW,
      updatedAt: NOW,
    });
    await repository.save(second);

    const handler = new FindActiveClinicalObjectivesByPatientHandler(repository);
    const results = await handler.execute(
      new FindActiveClinicalObjectivesByPatientQuery({
        tenantId: TENANT_ID,
        patientId: PATIENT_ID,
      }),
    );

    assert.equal(results.length, 2);
    assert.equal(results[0]?.priority, ClinicalObjectivePriorityValue.Critical);
  });
});
