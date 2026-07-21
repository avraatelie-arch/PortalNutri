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
import type { ClinicalObjectiveRepository } from '../domain/repositories/clinical-objective-repository.js';
import type { NutritionDiagnosisRepository } from '../domain/repositories/nutrition-diagnosis-repository.js';
import type { MealPlanRepository } from '../domain/repositories/meal-plan-repository.js';
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
import { CreateClinicalObjectiveHandler } from '../application/create-clinical-objective/create-clinical-objective.handler.js';
import { ActivateClinicalObjectiveHandler } from '../application/activate-clinical-objective/activate-clinical-objective.handler.js';
import { PauseClinicalObjectiveHandler } from '../application/pause-clinical-objective/pause-clinical-objective.handler.js';
import { ResumeClinicalObjectiveHandler } from '../application/resume-clinical-objective/resume-clinical-objective.handler.js';
import { CompleteClinicalObjectiveHandler } from '../application/complete-clinical-objective/complete-clinical-objective.handler.js';
import { CancelClinicalObjectiveHandler } from '../application/cancel-clinical-objective/cancel-clinical-objective.handler.js';
import { EditClinicalObjectiveHandler } from '../application/edit-clinical-objective/edit-clinical-objective.handler.js';
import { ChangeClinicalObjectiveResponsibleNutritionistHandler } from '../application/change-clinical-objective-responsible-nutritionist/change-clinical-objective-responsible-nutritionist.handler.js';
import { FindClinicalObjectiveHandler } from '../application/find-clinical-objective/find-clinical-objective.handler.js';
import { FindClinicalObjectivesByPatientHandler } from '../application/find-clinical-objectives-by-patient/find-clinical-objectives-by-patient.handler.js';
import { FindActiveClinicalObjectivesByPatientHandler } from '../application/find-active-clinical-objectives-by-patient/find-active-clinical-objectives-by-patient.handler.js';
import { CreateNutritionDiagnosisHandler } from '../application/create-nutrition-diagnosis/create-nutrition-diagnosis.handler.js';
import { EditNutritionDiagnosisHandler } from '../application/edit-nutrition-diagnosis/edit-nutrition-diagnosis.handler.js';
import { ConfirmNutritionDiagnosisHandler } from '../application/confirm-nutrition-diagnosis/confirm-nutrition-diagnosis.handler.js';
import { CancelNutritionDiagnosisHandler } from '../application/cancel-nutrition-diagnosis/cancel-nutrition-diagnosis.handler.js';
import { ChangeNutritionDiagnosisResponsibleNutritionistHandler } from '../application/change-nutrition-diagnosis-responsible-nutritionist/change-nutrition-diagnosis-responsible-nutritionist.handler.js';
import { FindNutritionDiagnosisHandler } from '../application/find-nutrition-diagnosis/find-nutrition-diagnosis.handler.js';
import { FindNutritionDiagnosesByPatientHandler } from '../application/find-nutrition-diagnoses-by-patient/find-nutrition-diagnoses-by-patient.handler.js';
import { FindConfirmedNutritionDiagnosesByPatientHandler } from '../application/find-confirmed-nutrition-diagnoses-by-patient/find-confirmed-nutrition-diagnoses-by-patient.handler.js';
import { CreateMealPlanHandler } from '../application/create-meal-plan/create-meal-plan.handler.js';
import { EditMealPlanHandler } from '../application/edit-meal-plan/edit-meal-plan.handler.js';
import { ActivateMealPlanHandler } from '../application/activate-meal-plan/activate-meal-plan.handler.js';
import { CancelMealPlanHandler } from '../application/cancel-meal-plan/cancel-meal-plan.handler.js';
import { ChangeMealPlanResponsibleNutritionistHandler } from '../application/change-meal-plan-responsible-nutritionist/change-meal-plan-responsible-nutritionist.handler.js';
import { FindMealPlanHandler } from '../application/find-meal-plan/find-meal-plan.handler.js';
import { FindMealPlansByPatientHandler } from '../application/find-meal-plans-by-patient/find-meal-plans-by-patient.handler.js';
import { FindActiveMealPlansByPatientHandler } from '../application/find-active-meal-plans-by-patient/find-active-meal-plans-by-patient.handler.js';
import { FindLatestMealPlanByPatientHandler } from '../application/find-latest-meal-plan-by-patient/find-latest-meal-plan-by-patient.handler.js';

export interface ClinicalFactoryDependencies {
  encounterRepository: ClinicalEncounterRepository;
  anamnesisRepository: AnamnesisRepository;
  anthropometricAssessmentRepository: AnthropometricAssessmentRepository;
  bodyCompositionAssessmentRepository: BodyCompositionAssessmentRepository;
  clinicalObjectiveRepository: ClinicalObjectiveRepository;
  nutritionDiagnosisRepository: NutritionDiagnosisRepository;
  mealPlanRepository: MealPlanRepository;
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
  createClinicalObjectiveHandler: CreateClinicalObjectiveHandler;
  activateClinicalObjectiveHandler: ActivateClinicalObjectiveHandler;
  pauseClinicalObjectiveHandler: PauseClinicalObjectiveHandler;
  resumeClinicalObjectiveHandler: ResumeClinicalObjectiveHandler;
  completeClinicalObjectiveHandler: CompleteClinicalObjectiveHandler;
  cancelClinicalObjectiveHandler: CancelClinicalObjectiveHandler;
  editClinicalObjectiveHandler: EditClinicalObjectiveHandler;
  changeClinicalObjectiveResponsibleNutritionistHandler: ChangeClinicalObjectiveResponsibleNutritionistHandler;
  findClinicalObjectiveHandler: FindClinicalObjectiveHandler;
  findClinicalObjectivesByPatientHandler: FindClinicalObjectivesByPatientHandler;
  findActiveClinicalObjectivesByPatientHandler: FindActiveClinicalObjectivesByPatientHandler;
  createNutritionDiagnosisHandler: CreateNutritionDiagnosisHandler;
  editNutritionDiagnosisHandler: EditNutritionDiagnosisHandler;
  confirmNutritionDiagnosisHandler: ConfirmNutritionDiagnosisHandler;
  cancelNutritionDiagnosisHandler: CancelNutritionDiagnosisHandler;
  changeNutritionDiagnosisResponsibleNutritionistHandler: ChangeNutritionDiagnosisResponsibleNutritionistHandler;
  findNutritionDiagnosisHandler: FindNutritionDiagnosisHandler;
  findNutritionDiagnosesByPatientHandler: FindNutritionDiagnosesByPatientHandler;
  findConfirmedNutritionDiagnosesByPatientHandler: FindConfirmedNutritionDiagnosesByPatientHandler;
  createMealPlanHandler: CreateMealPlanHandler;
  editMealPlanHandler: EditMealPlanHandler;
  activateMealPlanHandler: ActivateMealPlanHandler;
  cancelMealPlanHandler: CancelMealPlanHandler;
  changeMealPlanResponsibleNutritionistHandler: ChangeMealPlanResponsibleNutritionistHandler;
  findMealPlanHandler: FindMealPlanHandler;
  findMealPlansByPatientHandler: FindMealPlansByPatientHandler;
  findActiveMealPlansByPatientHandler: FindActiveMealPlansByPatientHandler;
  findLatestMealPlanByPatientHandler: FindLatestMealPlanByPatientHandler;
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
      deps.nutritionistDirectory,
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
      deps.nutritionistDirectory,
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
    createClinicalObjectiveHandler: new CreateClinicalObjectiveHandler(
      deps.clinicalObjectiveRepository,
      deps.tenantDirectory,
      deps.patientClinicalDirectory,
      deps.nutritionistDirectory,
      deps.clinicalEncounterDirectory,
      deps.anamnesisDirectory,
      deps.clock,
      deps.eventDispatcher,
    ),
    activateClinicalObjectiveHandler: new ActivateClinicalObjectiveHandler(
      deps.clinicalObjectiveRepository,
      deps.clock,
      deps.eventDispatcher,
    ),
    pauseClinicalObjectiveHandler: new PauseClinicalObjectiveHandler(
      deps.clinicalObjectiveRepository,
      deps.clock,
      deps.eventDispatcher,
    ),
    resumeClinicalObjectiveHandler: new ResumeClinicalObjectiveHandler(
      deps.clinicalObjectiveRepository,
      deps.clock,
      deps.eventDispatcher,
    ),
    completeClinicalObjectiveHandler: new CompleteClinicalObjectiveHandler(
      deps.clinicalObjectiveRepository,
      deps.clock,
      deps.eventDispatcher,
    ),
    cancelClinicalObjectiveHandler: new CancelClinicalObjectiveHandler(
      deps.clinicalObjectiveRepository,
      deps.clock,
      deps.eventDispatcher,
    ),
    editClinicalObjectiveHandler: new EditClinicalObjectiveHandler(
      deps.clinicalObjectiveRepository,
      deps.clock,
      deps.eventDispatcher,
    ),
    changeClinicalObjectiveResponsibleNutritionistHandler:
      new ChangeClinicalObjectiveResponsibleNutritionistHandler(
        deps.clinicalObjectiveRepository,
        deps.nutritionistDirectory,
        deps.clock,
        deps.eventDispatcher,
      ),
    findClinicalObjectiveHandler: new FindClinicalObjectiveHandler(
      deps.clinicalObjectiveRepository,
    ),
    findClinicalObjectivesByPatientHandler:
      new FindClinicalObjectivesByPatientHandler(deps.clinicalObjectiveRepository),
    findActiveClinicalObjectivesByPatientHandler:
      new FindActiveClinicalObjectivesByPatientHandler(
        deps.clinicalObjectiveRepository,
      ),
    createNutritionDiagnosisHandler: new CreateNutritionDiagnosisHandler(
      deps.nutritionDiagnosisRepository,
      deps.tenantDirectory,
      deps.patientClinicalDirectory,
      deps.nutritionistDirectory,
      deps.clinicalEncounterDirectory,
      deps.anamnesisDirectory,
      deps.clock,
      deps.eventDispatcher,
    ),
    editNutritionDiagnosisHandler: new EditNutritionDiagnosisHandler(
      deps.nutritionDiagnosisRepository,
      deps.clock,
      deps.eventDispatcher,
    ),
    confirmNutritionDiagnosisHandler: new ConfirmNutritionDiagnosisHandler(
      deps.nutritionDiagnosisRepository,
      deps.clock,
      deps.eventDispatcher,
    ),
    cancelNutritionDiagnosisHandler: new CancelNutritionDiagnosisHandler(
      deps.nutritionDiagnosisRepository,
      deps.clock,
      deps.eventDispatcher,
    ),
    changeNutritionDiagnosisResponsibleNutritionistHandler:
      new ChangeNutritionDiagnosisResponsibleNutritionistHandler(
        deps.nutritionDiagnosisRepository,
        deps.nutritionistDirectory,
        deps.clock,
        deps.eventDispatcher,
      ),
    findNutritionDiagnosisHandler: new FindNutritionDiagnosisHandler(
      deps.nutritionDiagnosisRepository,
    ),
    findNutritionDiagnosesByPatientHandler:
      new FindNutritionDiagnosesByPatientHandler(deps.nutritionDiagnosisRepository),
    findConfirmedNutritionDiagnosesByPatientHandler:
      new FindConfirmedNutritionDiagnosesByPatientHandler(
        deps.nutritionDiagnosisRepository,
      ),
    createMealPlanHandler: new CreateMealPlanHandler(
      deps.mealPlanRepository,
      deps.tenantDirectory,
      deps.patientClinicalDirectory,
      deps.nutritionistDirectory,
      deps.clinicalEncounterDirectory,
      deps.anamnesisDirectory,
      deps.clock,
      deps.eventDispatcher,
    ),
    editMealPlanHandler: new EditMealPlanHandler(
      deps.mealPlanRepository,
      deps.clock,
      deps.eventDispatcher,
    ),
    activateMealPlanHandler: new ActivateMealPlanHandler(
      deps.mealPlanRepository,
      deps.clock,
      deps.eventDispatcher,
    ),
    cancelMealPlanHandler: new CancelMealPlanHandler(
      deps.mealPlanRepository,
      deps.clock,
      deps.eventDispatcher,
    ),
    changeMealPlanResponsibleNutritionistHandler:
      new ChangeMealPlanResponsibleNutritionistHandler(
        deps.mealPlanRepository,
        deps.nutritionistDirectory,
        deps.clock,
        deps.eventDispatcher,
      ),
    findMealPlanHandler: new FindMealPlanHandler(deps.mealPlanRepository),
    findMealPlansByPatientHandler: new FindMealPlansByPatientHandler(
      deps.mealPlanRepository,
    ),
    findActiveMealPlansByPatientHandler: new FindActiveMealPlansByPatientHandler(
      deps.mealPlanRepository,
    ),
    findLatestMealPlanByPatientHandler: new FindLatestMealPlanByPatientHandler(
      deps.mealPlanRepository,
    ),
  };
}
