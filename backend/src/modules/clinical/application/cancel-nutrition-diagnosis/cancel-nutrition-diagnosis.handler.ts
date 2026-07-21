import type { EventDispatcher } from '../../../../core/application/events/event-dispatcher.js';
import type { NutritionDiagnosisRepository } from '../../domain/repositories/nutrition-diagnosis-repository.js';
import { CancellationReason } from '../../domain/value-objects/cancellation-reason.js';
import { toNutritionDiagnosisResult } from '../nutrition-diagnosis-result.js';
import { executeNutritionDiagnosisUseCase } from '../execute-nutrition-diagnosis-use-case.js';
import { loadTenantScopedNutritionDiagnosis } from '../load-tenant-scoped-nutrition-diagnosis.js';
import { mapNutritionDiagnosisDomainError } from '../map-nutrition-diagnosis-domain-error.js';
import { persistAndDispatchNutritionDiagnosisEvents } from '../persist-and-dispatch-nutrition-diagnosis-events.js';
import type { Clock } from '../ports/clock.port.js';
import { CancelNutritionDiagnosisCommand } from './cancel-nutrition-diagnosis.command.js';

export class CancelNutritionDiagnosisHandler {
  constructor(
    private readonly nutritionDiagnosisRepository: NutritionDiagnosisRepository,
    private readonly clock: Clock,
    private readonly eventDispatcher: EventDispatcher,
  ) {}

  async execute(command: CancelNutritionDiagnosisCommand) {
    return executeNutritionDiagnosisUseCase(async () => {
      const { tenantId, nutritionDiagnosisId, cancellationReason } = command.request;

      const diagnosis = await loadTenantScopedNutritionDiagnosis(
        this.nutritionDiagnosisRepository,
        tenantId,
        nutritionDiagnosisId,
      );

      try {
        diagnosis.cancel(
          {
            cancellationReason:
              cancellationReason !== undefined && cancellationReason !== null
                ? CancellationReason.create(cancellationReason)
                : undefined,
          },
          this.clock.now(),
        );
      }
      catch (error) {
        mapNutritionDiagnosisDomainError(
          tenantId,
          nutritionDiagnosisId,
          'cancel',
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
