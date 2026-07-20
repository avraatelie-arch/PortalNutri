import type { EventDispatcher } from '../../../core/application/events/event-dispatcher.js';
import type { Clock } from '../application/ports/clock.port.js';
import type { TenantDirectoryPort } from '../application/ports/tenant-directory.port.js';
import type { PatientDirectoryPort } from '../application/ports/patient-directory.port.js';
import type { NutritionistDirectoryPort } from '../application/ports/nutritionist-directory.port.js';
import type { AppointmentDirectoryPort } from '../application/ports/appointment-directory.port.js';
import type { ClinicalEncounterDirectoryPort } from '../application/ports/clinical-encounter-directory.port.js';
import type { ClinicalEncounterRepository } from '../domain/repositories/clinical-encounter-repository.js';
import type { AnamnesisRepository } from '../domain/repositories/anamnesis-repository.js';
import type { AnamnesisCompletionPolicy } from '../domain/policies/anamnesis-completion-policy.js';
import { StartClinicalEncounterHandler } from '../application/start-clinical-encounter/start-clinical-encounter.handler.js';
import { FinishClinicalEncounterHandler } from '../application/finish-clinical-encounter/finish-clinical-encounter.handler.js';
import { CancelClinicalEncounterHandler } from '../application/cancel-clinical-encounter/cancel-clinical-encounter.handler.js';
import { UpdateClinicalNotesHandler } from '../application/update-clinical-notes/update-clinical-notes.handler.js';
import { FindClinicalEncounterHandler } from '../application/find-clinical-encounter/find-clinical-encounter.handler.js';
import { StartAnamnesisHandler } from '../application/start-anamnesis/start-anamnesis.handler.js';
import { UpdateAnamnesisSectionHandler } from '../application/update-anamnesis-section/update-anamnesis-section.handler.js';
import { CompleteAnamnesisHandler } from '../application/complete-anamnesis/complete-anamnesis.handler.js';
import { FindAnamnesisHandler } from '../application/find-anamnesis/find-anamnesis.handler.js';
import { FindAnamnesisByClinicalEncounterHandler } from '../application/find-anamnesis-by-clinical-encounter/find-anamnesis-by-clinical-encounter.handler.js';

export interface ClinicalFactoryDependencies {
  encounterRepository: ClinicalEncounterRepository;
  anamnesisRepository: AnamnesisRepository;
  tenantDirectory: TenantDirectoryPort;
  patientDirectory: PatientDirectoryPort;
  nutritionistDirectory: NutritionistDirectoryPort;
  appointmentDirectory: AppointmentDirectoryPort;
  clinicalEncounterDirectory: ClinicalEncounterDirectoryPort;
  anamnesisCompletionPolicy: AnamnesisCompletionPolicy;
  clock: Clock;
  eventDispatcher: EventDispatcher;
}

export interface ClinicalHandlers {
  startClinicalEncounterHandler: StartClinicalEncounterHandler;
  finishClinicalEncounterHandler: FinishClinicalEncounterHandler;
  cancelClinicalEncounterHandler: CancelClinicalEncounterHandler;
  updateClinicalNotesHandler: UpdateClinicalNotesHandler;
  findClinicalEncounterHandler: FindClinicalEncounterHandler;
  startAnamnesisHandler: StartAnamnesisHandler;
  updateAnamnesisSectionHandler: UpdateAnamnesisSectionHandler;
  completeAnamnesisHandler: CompleteAnamnesisHandler;
  findAnamnesisHandler: FindAnamnesisHandler;
  findAnamnesisByClinicalEncounterHandler: FindAnamnesisByClinicalEncounterHandler;
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
    startAnamnesisHandler: new StartAnamnesisHandler(
      deps.anamnesisRepository,
      deps.tenantDirectory,
      deps.clinicalEncounterDirectory,
      deps.clock,
      deps.eventDispatcher,
    ),
    updateAnamnesisSectionHandler: new UpdateAnamnesisSectionHandler(
      deps.anamnesisRepository,
      deps.clock,
      deps.eventDispatcher,
    ),
    completeAnamnesisHandler: new CompleteAnamnesisHandler(
      deps.anamnesisRepository,
      deps.anamnesisCompletionPolicy,
      deps.clock,
      deps.eventDispatcher,
    ),
    findAnamnesisHandler: new FindAnamnesisHandler(deps.anamnesisRepository),
    findAnamnesisByClinicalEncounterHandler:
      new FindAnamnesisByClinicalEncounterHandler(deps.anamnesisRepository),
  };
}
