import type { EventDispatcher } from '../../../../core/application/events/event-dispatcher.js';
import type { NutritionDiagnosisRepository } from '../../domain/repositories/nutrition-diagnosis-repository.js';
import { validateActiveNutritionistForNutritionDiagnosis } from '../nutrition-diagnosis-creation-context.js';
import { createNutritionDiagnosisCreationContextErrors } from '../nutrition-diagnosis-creation-context.errors.js';
import { toNutritionDiagnosisResult } from '../nutrition-diagnosis-result.js';
import { executeNutritionDiagnosisUseCase } from '../execute-nutrition-diagnosis-use-case.js';
import { loadTenantScopedNutritionDiagnosis } from '../load-tenant-scoped-nutrition-diagnosis.js';
import { mapNutritionDiagnosisDomainError } from '../map-nutrition-diagnosis-domain-error.js';
import { persistAndDispatchNutritionDiagnosisEvents } from '../persist-and-dispatch-nutrition-diagnosis-events.js';
import type { Clock } from '../ports/clock.port.js';
import type { NutritionistDirectoryPort } from '../ports/nutritionist-directory.port.js';
import { ChangeNutritionDiagnosisResponsibleNutritionistCommand } from './change-nutrition-diagnosis-responsible-nutritionist.command.js';

export class ChangeNutritionDiagnosisResponsibleNutritionistHandler {
  private readonly creationContextErrors =
    createNutritionDiagnosisCreationContextErrors();

  constructor(
    private readonly nutritionDiagnosisRepository: NutritionDiagnosisRepository,
    private readonly nutritionistDirectory: NutritionistDirectoryPort,
    private readonly clock: Clock,
    private readonly eventDispatcher: EventDispatcher,
  ) {}

  async execute(command: ChangeNutritionDiagnosisResponsibleNutritionistCommand) {
    return executeNutritionDiagnosisUseCase(async () => {
      const { tenantId, nutritionDiagnosisId, responsibleNutritionistId } =
        command.request;

      await validateActiveNutritionistForNutritionDiagnosis({
        nutritionistDirectory: this.nutritionistDirectory,
        tenantId,
        nutritionistId: responsibleNutritionistId,
        errors: this.creationContextErrors,
      });

      const diagnosis = await loadTenantScopedNutritionDiagnosis(
        this.nutritionDiagnosisRepository,
        tenantId,
        nutritionDiagnosisId,
      );

      let changed: boolean;

      try {
        changed = diagnosis.changeResponsibleNutritionist(
          responsibleNutritionistId,
          this.clock.now(),
        );
      }
      catch (error) {
        mapNutritionDiagnosisDomainError(
          tenantId,
          nutritionDiagnosisId,
          'changeResponsibleNutritionist',
          error,
        );
      }

      if (changed) {
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
