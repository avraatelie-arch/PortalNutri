import type { NutritionDiagnosis } from '../domain/aggregates/nutrition-diagnosis.aggregate.js';
import type { NutritionDiagnosisRepository } from '../domain/repositories/nutrition-diagnosis-repository.js';
import type { EventDispatcher } from '../../../core/application/events/event-dispatcher.js';
import { persistAndDispatchClinicalModuleEvents } from './persist-and-dispatch-clinical-module-events.js';

export async function persistAndDispatchNutritionDiagnosisEvents(
  repository: NutritionDiagnosisRepository,
  eventDispatcher: EventDispatcher,
  diagnosis: NutritionDiagnosis,
): Promise<void> {
  return persistAndDispatchClinicalModuleEvents(
    repository,
    eventDispatcher,
    diagnosis,
  );
}
