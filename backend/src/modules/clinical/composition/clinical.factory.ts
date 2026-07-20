import type { EventDispatcher } from '../../../core/application/events/event-dispatcher.js';
import type { Clock } from '../application/ports/clock.port.js';
import type { TenantDirectoryPort } from '../application/ports/tenant-directory.port.js';
import type { PatientDirectoryPort } from '../application/ports/patient-directory.port.js';
import type { NutritionistDirectoryPort } from '../application/ports/nutritionist-directory.port.js';
import type { AppointmentDirectoryPort } from '../application/ports/appointment-directory.port.js';
import type { ClinicalEncounterDirectoryPort } from '../application/ports/clinical-encounter-directory.port.js';
import type { AnamnesisDirectoryPort } from '../application/ports/anamnesis-directory.port.js';
import type { PatientClinicalDirectoryPort } from '../application/ports/patient-clinical-directory.port.js';
import type { ClinicalEncounterRepository } from '../domain/repositories/clinical-encounter-repository.js';
import type { AnamnesisRepository } from '../domain/repositories/anamnesis-repository.js';
import type { AnthropometricAssessmentRepository } from '../domain/repositories/anthropometric-assessment-repository.js';
import type { BodyCompositionAssessmentRepository } from '../domain/repositories/body-composition-assessment-repository.js';
import type { AnamnesisCompletionPolicy } from '../domain/policies/anamnesis-completion-policy.js';
import type { BodyMassIndexClassificationPolicy } from '../domain/policies/body-mass-index-classification-policy.js';
import type { BodyCompositionConsistencyPolicy } from '../domain/policies/body-composition-consistency-policy.js';
import type { AnthropometricAssessmentDirectoryPort } from '../application/ports/anthropometric-assessment-directory.port.js';
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
import { RecordAnthropometricAssessmentHandler } from '../application/record-anthropometric-assessment/record-anthropometric-assessment.handler.js';
import { FindAnthropometricAssessmentHandler } from '../application/find-anthropometric-assessment/find-anthropometric-assessment.handler.js';
import { FindAnthropometricAssessmentsByAnamnesisHandler } from '../application/find-anthropometric-assessments-by-anamnesis/find-anthropometric-assessments-by-anamnesis.handler.js';
import { FindAnthropometricAssessmentsByPatientHandler } from '../application/find-anthropometric-assessments-by-patient/find-anthropometric-assessments-by-patient.handler.js';
import { RecordBodyCompositionAssessmentHandler } from '../application/record-body-composition-assessment/record-body-composition-assessment.handler.js';
import { FindBodyCompositionAssessmentHandler } from '../application/find-body-composition-assessment/find-body-composition-assessment.handler.js';
import { FindBodyCompositionAssessmentsByAnamnesisHandler } from '../application/find-body-composition-assessments-by-anamnesis/find-body-composition-assessments-by-anamnesis.handler.js';
import { FindBodyCompositionAssessmentsByPatientHandler } from '../application/find-body-composition-assessments-by-patient/find-body-composition-assessments-by-patient.handler.js';

export interface ClinicalFactoryDependencies {
  encounterRepository: ClinicalEncounterRepository;
  anamnesisRepository: AnamnesisRepository;
  anthropometricAssessmentRepository: AnthropometricAssessmentRepository;
  bodyCompositionAssessmentRepository: BodyCompositionAssessmentRepository;
  anthropometricAssessmentDirectory: AnthropometricAssessmentDirectoryPort;
  tenantDirectory: TenantDirectoryPort;
  patientDirectory: PatientDirectoryPort;
  nutritionistDirectory: NutritionistDirectoryPort;
  appointmentDirectory: AppointmentDirectoryPort;
  clinicalEncounterDirectory: ClinicalEncounterDirectoryPort;
  anamnesisDirectory: AnamnesisDirectoryPort;
  patientClinicalDirectory: PatientClinicalDirectoryPort;
  anamnesisCompletionPolicy: AnamnesisCompletionPolicy;
  bodyMassIndexClassificationPolicy: BodyMassIndexClassificationPolicy;
  bodyCompositionConsistencyPolicy: BodyCompositionConsistencyPolicy;
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
  recordAnthropometricAssessmentHandler: RecordAnthropometricAssessmentHandler;
  findAnthropometricAssessmentHandler: FindAnthropometricAssessmentHandler;
  findAnthropometricAssessmentsByAnamnesisHandler: FindAnthropometricAssessmentsByAnamnesisHandler;
  findAnthropometricAssessmentsByPatientHandler: FindAnthropometricAssessmentsByPatientHandler;
  recordBodyCompositionAssessmentHandler: RecordBodyCompositionAssessmentHandler;
  findBodyCompositionAssessmentHandler: FindBodyCompositionAssessmentHandler;
  findBodyCompositionAssessmentsByAnamnesisHandler: FindBodyCompositionAssessmentsByAnamnesisHandler;
  findBodyCompositionAssessmentsByPatientHandler: FindBodyCompositionAssessmentsByPatientHandler;
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
    recordAnthropometricAssessmentHandler: new RecordAnthropometricAssessmentHandler(
      deps.anthropometricAssessmentRepository,
      deps.tenantDirectory,
      deps.anamnesisDirectory,
      deps.clinicalEncounterDirectory,
      deps.patientClinicalDirectory,
      deps.bodyMassIndexClassificationPolicy,
      deps.clock,
      deps.eventDispatcher,
    ),
    findAnthropometricAssessmentHandler: new FindAnthropometricAssessmentHandler(
      deps.anthropometricAssessmentRepository,
    ),
    findAnthropometricAssessmentsByAnamnesisHandler:
      new FindAnthropometricAssessmentsByAnamnesisHandler(
        deps.anthropometricAssessmentRepository,
      ),
    findAnthropometricAssessmentsByPatientHandler:
      new FindAnthropometricAssessmentsByPatientHandler(
        deps.anthropometricAssessmentRepository,
      ),
    recordBodyCompositionAssessmentHandler: new RecordBodyCompositionAssessmentHandler(
      deps.bodyCompositionAssessmentRepository,
      deps.tenantDirectory,
      deps.anamnesisDirectory,
      deps.clinicalEncounterDirectory,
      deps.patientClinicalDirectory,
      deps.anthropometricAssessmentDirectory,
      deps.bodyCompositionConsistencyPolicy,
      deps.clock,
      deps.eventDispatcher,
    ),
    findBodyCompositionAssessmentHandler: new FindBodyCompositionAssessmentHandler(
      deps.bodyCompositionAssessmentRepository,
    ),
    findBodyCompositionAssessmentsByAnamnesisHandler:
      new FindBodyCompositionAssessmentsByAnamnesisHandler(
        deps.bodyCompositionAssessmentRepository,
      ),
    findBodyCompositionAssessmentsByPatientHandler:
      new FindBodyCompositionAssessmentsByPatientHandler(
        deps.bodyCompositionAssessmentRepository,
      ),
  };
}
