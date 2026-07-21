import type { EventDispatcher } from '../../../../core/application/events/event-dispatcher.js';
import type { NutritionDiagnosisRepository } from '../../domain/repositories/nutrition-diagnosis-repository.js';
import { NutritionProblemCategory } from '../../domain/value-objects/nutrition-problem-category.js';
import { ProfessionalInterpretation } from '../../domain/value-objects/professional-interpretation.js';
import { toNutritionDiagnosisResult } from '../nutrition-diagnosis-result.js';
import { executeNutritionDiagnosisUseCase } from '../execute-nutrition-diagnosis-use-case.js';
import { loadTenantScopedNutritionDiagnosis } from '../load-tenant-scoped-nutrition-diagnosis.js';
import { mapNutritionDiagnosisDomainError } from '../map-nutrition-diagnosis-domain-error.js';
import { persistAndDispatchNutritionDiagnosisEvents } from '../persist-and-dispatch-nutrition-diagnosis-events.js';
import type { Clock } from '../ports/clock.port.js';
import { EditNutritionDiagnosisCommand } from './edit-nutrition-diagnosis.command.js';

export class EditNutritionDiagnosisHandler {
  constructor(
    private readonly nutritionDiagnosisRepository: NutritionDiagnosisRepository,
    private readonly clock: Clock,
    private readonly eventDispatcher: EventDispatcher,
  ) {}

  async execute(command: EditNutritionDiagnosisCommand) {
    return executeNutritionDiagnosisUseCase(async () => {
      const {
        tenantId,
        nutritionDiagnosisId,
        problemCategory,
        professionalInterpretation,
      } = command.request;

      const diagnosis = await loadTenantScopedNutritionDiagnosis(
        this.nutritionDiagnosisRepository,
        tenantId,
        nutritionDiagnosisId,
      );

      let changedFields: string[];

      try {
        changedFields = diagnosis.edit(
          {
            problemCategory: problemCategory
              ? NutritionProblemCategory.parse(problemCategory)
              : undefined,
            professionalInterpretation:
              professionalInterpretation !== undefined
                ? ProfessionalInterpretation.create(professionalInterpretation)
                : undefined,
          },
          this.clock.now(),
        );
      }
      catch (error) {
        mapNutritionDiagnosisDomainError(
          tenantId,
          nutritionDiagnosisId,
          'edit',
          error,
        );
      }

      if (changedFields.length > 0) {
        await persistAndDispatchNutritionDiagnosisEvents(
          this.nutritionDiagnosisRepository,
          this.eventDispatcher,
          diagnosis,
        );
      }

      return toNutritionDiagnosisResult(diagnosis);
    });
  }
}
