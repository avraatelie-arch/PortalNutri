import type { OutcomeTracking } from '../domain/aggregates/outcome-tracking.aggregate.js';
import type { OutcomeTrackingRepository } from '../domain/repositories/outcome-tracking-repository.js';
import type { EventDispatcher } from '../../../core/application/events/event-dispatcher.js';
import { persistAndDispatchClinicalModuleEvents } from './persist-and-dispatch-clinical-module-events.js';

export async function persistAndDispatchOutcomeTrackingEvents(
  repository: OutcomeTrackingRepository,
  eventDispatcher: EventDispatcher,
  tracking: OutcomeTracking,
): Promise<void> {
  return persistAndDispatchClinicalModuleEvents(
    repository,
    eventDispatcher,
    tracking,
  );
}
