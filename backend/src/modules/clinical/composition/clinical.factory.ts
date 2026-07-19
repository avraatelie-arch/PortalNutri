import type { EventDispatcher } from '../../../core/application/events/event-dispatcher.js';
import type { Clock } from '../application/ports/clock.port.js';
import type { TenantDirectoryPort } from '../application/ports/tenant-directory.port.js';
import type { PatientDirectoryPort } from '../application/ports/patient-directory.port.js';
import type { NutritionistDirectoryPort } from '../application/ports/nutritionist-directory.port.js';
import type { AppointmentDirectoryPort } from '../application/ports/appointment-directory.port.js';
import type { ClinicalEncounterRepository } from '../domain/repositories/clinical-encounter-repository.js';
import { StartClinicalEncounterHandler } from '../application/start-clinical-encounter/start-clinical-encounter.handler.js';
import { FinishClinicalEncounterHandler } from '../application/finish-clinical-encounter/finish-clinical-encounter.handler.js';
import { CancelClinicalEncounterHandler } from '../application/cancel-clinical-encounter/cancel-clinical-encounter.handler.js';
import { UpdateClinicalNotesHandler } from '../application/update-clinical-notes/update-clinical-notes.handler.js';
import { FindClinicalEncounterHandler } from '../application/find-clinical-encounter/find-clinical-encounter.handler.js';

export interface ClinicalFactoryDependencies {
  encounterRepository: ClinicalEncounterRepository;
  tenantDirectory: TenantDirectoryPort;
  patientDirectory: PatientDirectoryPort;
  nutritionistDirectory: NutritionistDirectoryPort;
  appointmentDirectory: AppointmentDirectoryPort;
  clock: Clock;
  eventDispatcher: EventDispatcher;
}

export interface ClinicalHandlers {
  startClinicalEncounterHandler: StartClinicalEncounterHandler;
  finishClinicalEncounterHandler: FinishClinicalEncounterHandler;
  cancelClinicalEncounterHandler: CancelClinicalEncounterHandler;
  updateClinicalNotesHandler: UpdateClinicalNotesHandler;
  findClinicalEncounterHandler: FindClinicalEncounterHandler;
}

export function createClinicalHandlers(
  deps: ClinicalFactoryDependencies,
): ClinicalHandlers {
  return {
    startClinicalEncounterHandler: new StartClinicalEncounterHandler(
      deps.encounterRepository,
      deps.tenantDirectory,
      deps.patientDirectory,
      deps.nutritionistDirectory,
      deps.appointmentDirectory,
      deps.clock,
      deps.eventDispatcher,
    ),
    finishClinicalEncounterHandler: new FinishClinicalEncounterHandler(
      deps.encounterRepository,
      deps.clock,
      deps.eventDispatcher,
    ),
    cancelClinicalEncounterHandler: new CancelClinicalEncounterHandler(
      deps.encounterRepository,
      deps.clock,
      deps.eventDispatcher,
    ),
    updateClinicalNotesHandler: new UpdateClinicalNotesHandler(
      deps.encounterRepository,
      deps.clock,
      deps.eventDispatcher,
    ),
    findClinicalEncounterHandler: new FindClinicalEncounterHandler(
      deps.encounterRepository,
    ),
  };
}
