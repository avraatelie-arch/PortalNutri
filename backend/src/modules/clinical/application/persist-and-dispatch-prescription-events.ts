import type { Prescription } from '../domain/aggregates/prescription.aggregate.js';
import type { PrescriptionRepository } from '../domain/repositories/prescription-repository.js';
import type { EventDispatcher } from '../../../core/application/events/event-dispatcher.js';
import { persistAndDispatchClinicalModuleEvents } from './persist-and-dispatch-clinical-module-events.js';

export async function persistAndDispatchPrescriptionEvents(
  repository: PrescriptionRepository,
  eventDispatcher: EventDispatcher,
  prescription: Prescription,
): Promise<void> {
  return persistAndDispatchClinicalModuleEvents(
    repository,
    eventDispatcher,
    prescription,
  );
}
