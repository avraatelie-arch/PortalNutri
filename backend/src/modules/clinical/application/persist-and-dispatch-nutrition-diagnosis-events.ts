import type { NutritionDiagnosis } from '../domain/aggregates/nutrition-diagnosis.aggregate.js';
import type { NutritionDiagnosisRepository } from '../domain/repositories/nutrition-diagnosis-repository.js';
import type { EventDispatcher } from '../../../core/application/events/event-dispatcher.js';

export async function persistAndDispatchNutritionDiagnosisEvents(
  repository: NutritionDiagnosisRepository,
  eventDispatcher: EventDispatcher,
  diagnosis: NutritionDiagnosis,
): Promise<void> {
  const events = diagnosis.pullDomainEvents();

  if (events.length === 0) {
    return;
  }

  await repository.save(diagnosis);
  await eventDispatcher.dispatch(events);
}
