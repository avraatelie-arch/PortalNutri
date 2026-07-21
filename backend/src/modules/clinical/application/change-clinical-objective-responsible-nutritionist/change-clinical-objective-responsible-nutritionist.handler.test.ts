import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { FixedClock } from '../../../../test-support/fixed-clock.js';
import { noopEventDispatcher } from '../../../../test-support/noop-event-dispatcher.js';
import { ClinicalObjective } from '../../domain/aggregates/clinical-objective.aggregate.js';
import { ClinicalObjectiveId } from '../../domain/value-objects/clinical-objective-id.js';
import { ClinicalObjectiveTitle } from '../../domain/value-objects/clinical-objective-title.js';
import { ClinicalObjectiveType } from '../../domain/value-objects/clinical-objective-type.js';
import { InMemoryNutritionistDirectory } from '../../infrastructure/adapters/in-memory-nutritionist-directory.js';
import { InMemoryClinicalObjectiveRepository } from '../../infrastructure/repositories/in-memory-clinical-objective.repository.js';
import { NutritionistInactiveForClinicalObjectiveError } from '../errors/nutritionist-inactive-for-clinical-objective.error.js';
import { ChangeClinicalObjectiveResponsibleNutritionistCommand } from './change-clinical-objective-responsible-nutritionist.command.js';
import { ChangeClinicalObjectiveResponsibleNutritionistHandler } from './change-clinical-objective-responsible-nutritionist.handler.js';

const NOW = new Date('2026-07-20T10:00:00.000Z');
const LATER = new Date('2026-07-20T11:00:00.000Z');
const TENANT_ID = '550e8400-e29b-41d4-a716-446655440001';
const PATIENT_ID = '550e8400-e29b-41d4-a716-446655440020';
const CREATED_BY_ID = '550e8400-e29b-41d4-a716-446655440030';
const RESPONSIBLE_ID = '550e8400-e29b-41d4-a716-446655440031';
const NEW_RESPONSIBLE_ID = '550e8400-e29b-41d4-a716-446655440032';
const OBJECTIVE_ID = '550e8400-e29b-41d4-a716-446655440070';

describe('ChangeClinicalObjectiveResponsibleNutritionistHandler', () => {
  it('changes responsible nutritionist when new nutritionist is active', async () => {
    const repository = new InMemoryClinicalObjectiveRepository();
    const objective = ClinicalObjective.create({
      id: ClinicalObjectiveId.create(OBJECTIVE_ID),
      tenantId: TENANT_ID,
      patientId: PATIENT_ID,
      createdByNutritionistId: CREATED_BY_ID,
      responsibleNutritionistId: RESPONSIBLE_ID,
      type: ClinicalObjectiveType.parse('WEIGHT_LOSS'),
      title: ClinicalObjectiveTitle.create('Title'),
      now: NOW,
    });
    objective.clearDomainEvents();
    await repository.save(objective);

    const nutritionistDirectory = new InMemoryNutritionistDirectory();
    nutritionistDirectory.seed({ id: NEW_RESPONSIBLE_ID, tenantId: TENANT_ID, status: 'ACTIVE' });

    const handler = new ChangeClinicalObjectiveResponsibleNutritionistHandler(
      repository,
      nutritionistDirectory,
      new FixedClock(LATER),
      noopEventDispatcher,
    );

    const result = await handler.execute(
      new ChangeClinicalObjectiveResponsibleNutritionistCommand({
        tenantId: TENANT_ID,
        clinicalObjectiveId: OBJECTIVE_ID,
        responsibleNutritionistId: NEW_RESPONSIBLE_ID,
      }),
    );

    assert.equal(result.responsibleNutritionistId, NEW_RESPONSIBLE_ID);
    assert.equal(result.version, 2);
  });

  it('rejects inactive nutritionist', async () => {
    const repository = new InMemoryClinicalObjectiveRepository();
    const objective = ClinicalObjective.create({
      id: ClinicalObjectiveId.create(OBJECTIVE_ID),
      tenantId: TENANT_ID,
      patientId: PATIENT_ID,
      createdByNutritionistId: CREATED_BY_ID,
      responsibleNutritionistId: RESPONSIBLE_ID,
      type: ClinicalObjectiveType.parse('WEIGHT_LOSS'),
      title: ClinicalObjectiveTitle.create('Title'),
      now: NOW,
    });
    await repository.save(objective);

    const nutritionistDirectory = new InMemoryNutritionistDirectory();
    nutritionistDirectory.seed({ id: NEW_RESPONSIBLE_ID, tenantId: TENANT_ID, status: 'INACTIVE' });

    const handler = new ChangeClinicalObjectiveResponsibleNutritionistHandler(
      repository,
      nutritionistDirectory,
      new FixedClock(LATER),
      noopEventDispatcher,
    );

    await assert.rejects(
      () =>
        handler.execute(
          new ChangeClinicalObjectiveResponsibleNutritionistCommand({
            tenantId: TENANT_ID,
            clinicalObjectiveId: OBJECTIVE_ID,
            responsibleNutritionistId: NEW_RESPONSIBLE_ID,
          }),
        ),
      NutritionistInactiveForClinicalObjectiveError,
    );
  });
});
