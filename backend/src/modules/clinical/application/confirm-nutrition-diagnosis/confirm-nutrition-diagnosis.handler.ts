import type { EventDispatcher } from '../../../../core/application/events/event-dispatcher.js';
import type { NutritionDiagnosisRepository } from '../../domain/repositories/nutrition-diagnosis-repository.js';
import { toNutritionDiagnosisResult } from '../nutrition-diagnosis-result.js';
import { executeNutritionDiagnosisUseCase } from '../execute-nutrition-diagnosis-use-case.js';
import { loadTenantScopedNutritionDiagnosis } from '../load-tenant-scoped-nutrition-diagnosis.js';
import { mapNutritionDiagnosisDomainError } from '../map-nutrition-diagnosis-domain-error.js';
import { persistAndDispatchNutritionDiagnosisEvents } from '../persist-and-dispatch-nutrition-diagnosis-events.js';
import type { Clock } from '../ports/clock.port.js';
import { ConfirmNutritionDiagnosisCommand } from './confirm-nutrition-diagnosis.command.js';

export class ConfirmNutritionDiagnosisHandler {
  constructor(
    private readonly nutritionDiagnosisRepository: NutritionDiagnosisRepository,
    private readonly clock: Clock,
    private readonly eventDispatcher: EventDispatcher,
  ) {}

  async execute(command: ConfirmNutritionDiagnosisCommand) {
    return executeNutritionDiagnosisUseCase(async () => {
      const { tenantId, nutritionDiagnosisId } = command.request;

      const diagnosis = await loadTenantScopedNutritionDiagnosis(
        this.nutritionDiagnosisRepository,
        tenantId,
        nutritionDiagnosisId,
      );

      try {
        diagnosis.confirm(this.clock.now());
      }
      catch (error) {
        mapNutritionDiagnosisDomainError(
          tenantId,
          nutritionDiagnosisId,
          'confirm',
          error,
        );
      }

      await persistAndDispatchNutritionDiagnosisEvents(
        this.nutritionDiagnosisRepository,
        this.eventDispatcher,
        diagnosis,
      );

      return toNutritionDiagnosisResult(diagnosis);
    });
  }
}
