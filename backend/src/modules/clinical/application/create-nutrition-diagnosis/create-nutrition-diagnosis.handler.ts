import type { EventDispatcher } from '../../../../core/application/events/event-dispatcher.js';
import { NutritionDiagnosis } from '../../domain/aggregates/nutrition-diagnosis.aggregate.js';
import type { NutritionDiagnosisRepository } from '../../domain/repositories/nutrition-diagnosis-repository.js';
import { NutritionProblemCategory } from '../../domain/value-objects/nutrition-problem-category.js';
import { ProfessionalInterpretation } from '../../domain/value-objects/professional-interpretation.js';
import {
  buildNutritionDiagnosisCreationContext,
} from '../nutrition-diagnosis-creation-context.js';
import { createNutritionDiagnosisCreationContextErrors } from '../nutrition-diagnosis-creation-context.errors.js';
import { toNutritionDiagnosisResult } from '../nutrition-diagnosis-result.js';
import { executeNutritionDiagnosisUseCase } from '../execute-nutrition-diagnosis-use-case.js';
import type { AnamnesisDirectoryPort } from '../ports/anamnesis-directory.port.js';
import type { ClinicalEncounterDirectoryPort } from '../ports/clinical-encounter-directory.port.js';
import type { Clock } from '../ports/clock.port.js';
import type { NutritionistDirectoryPort } from '../ports/nutritionist-directory.port.js';
import type { PatientClinicalDirectoryPort } from '../ports/patient-clinical-directory.port.js';
import type { TenantDirectoryPort } from '../ports/tenant-directory.port.js';
import { CreateNutritionDiagnosisCommand } from './create-nutrition-diagnosis.command.js';

export class CreateNutritionDiagnosisHandler {
  private readonly creationContextErrors =
    createNutritionDiagnosisCreationContextErrors();

  constructor(
    private readonly nutritionDiagnosisRepository: NutritionDiagnosisRepository,
    private readonly tenantDirectory: TenantDirectoryPort,
    private readonly patientClinicalDirectory: PatientClinicalDirectoryPort,
    private readonly nutritionistDirectory: NutritionistDirectoryPort,
    private readonly clinicalEncounterDirectory: ClinicalEncounterDirectoryPort,
    private readonly anamnesisDirectory: AnamnesisDirectoryPort,
    private readonly clock: Clock,
    private readonly eventDispatcher: EventDispatcher,
  ) {}

  async execute(command: CreateNutritionDiagnosisCommand) {
    return executeNutritionDiagnosisUseCase(async () => {
      const {
        tenantId,
        patientId,
        createdByNutritionistId,
        responsibleNutritionistId,
        originClinicalEncounterId,
        originAnamnesisId,
        problemCategory,
        professionalInterpretation,
      } = command.request;

      await buildNutritionDiagnosisCreationContext({
        tenantDirectory: this.tenantDirectory,
        patientClinicalDirectory: this.patientClinicalDirectory,
        nutritionistDirectory: this.nutritionistDirectory,
        clinicalEncounterDirectory: this.clinicalEncounterDirectory,
        anamnesisDirectory: this.anamnesisDirectory,
        request: {
          tenantId,
          patientId,
          createdByNutritionistId,
          responsibleNutritionistId,
          originClinicalEncounterId,
          originAnamnesisId,
        },
        errors: this.creationContextErrors,
      });

      const diagnosis = NutritionDiagnosis.create({
        tenantId,
        patientId,
        createdByNutritionistId,
        responsibleNutritionistId,
        originClinicalEncounterId,
        originAnamnesisId,
        problemCategory: problemCategory
          ? NutritionProblemCategory.parse(problemCategory)
          : undefined,
        professionalInterpretation:
          professionalInterpretation !== undefined
            ? ProfessionalInterpretation.create(professionalInterpretation)
            : undefined,
        now: this.clock.now(),
      });

      await this.nutritionDiagnosisRepository.save(diagnosis);
      await this.eventDispatcher.dispatch(diagnosis.pullDomainEvents());

      return toNutritionDiagnosisResult(diagnosis);
    });
  }
}
