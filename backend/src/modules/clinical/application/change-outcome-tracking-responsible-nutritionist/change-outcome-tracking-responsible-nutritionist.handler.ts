import type { EventDispatcher } from '../../../../core/application/events/event-dispatcher.js';
import type { OutcomeTrackingRepository } from '../../domain/repositories/outcome-tracking-repository.js';
import { validateActiveNutritionistForOutcomeTracking } from '../outcome-tracking-creation-context.js';
import { createOutcomeTrackingNutritionistValidationErrors } from '../outcome-tracking-creation-context.errors.js';
import { executeOutcomeTrackingUseCase } from '../execute-outcome-tracking-use-case.js';
import { loadTenantScopedOutcomeTracking } from '../load-tenant-scoped-outcome-tracking.js';
import { mapOutcomeTrackingDomainError } from '../map-outcome-tracking-domain-error.js';
import { toOutcomeTrackingResult } from '../outcome-tracking-result.js';
import { persistAndDispatchOutcomeTrackingEvents } from '../persist-and-dispatch-outcome-tracking-events.js';
import type { Clock } from '../ports/clock.port.js';
import type { NutritionistDirectoryPort } from '../ports/nutritionist-directory.port.js';
import { ChangeOutcomeTrackingResponsibleNutritionistCommand } from './change-outcome-tracking-responsible-nutritionist.command.js';

export class ChangeOutcomeTrackingResponsibleNutritionistHandler {
  private readonly nutritionistValidationErrors =
    createOutcomeTrackingNutritionistValidationErrors();

  constructor(
    private readonly outcomeTrackingRepository: OutcomeTrackingRepository,
    private readonly nutritionistDirectory: NutritionistDirectoryPort,
    private readonly clock: Clock,
    private readonly eventDispatcher: EventDispatcher,
  ) {}

  async execute(command: ChangeOutcomeTrackingResponsibleNutritionistCommand) {
    return executeOutcomeTrackingUseCase(async () => {
      const { tenantId, outcomeTrackingId, responsibleNutritionistId } =
        command.request;

      await validateActiveNutritionistForOutcomeTracking({
        nutritionistDirectory: this.nutritionistDirectory,
        tenantId,
        nutritionistId: responsibleNutritionistId,
        errors: this.nutritionistValidationErrors,
      });

      const tracking = await loadTenantScopedOutcomeTracking(
        this.outcomeTrackingRepository,
        tenantId,
        outcomeTrackingId,
      );

      let changed: boolean;

      try {
        changed = tracking.changeResponsibleNutritionist(
          responsibleNutritionistId,
          this.clock.now(),
        );
      }
      catch (error) {
        mapOutcomeTrackingDomainError(
          tenantId,
          outcomeTrackingId,
          'changeResponsibleNutritionist',
          error,
        );
      }

      if (changed) {
        await persistAndDispatchOutcomeTrackingEvents(
          this.outcomeTrackingRepository,
          this.eventDispatcher,
          tracking,
        );
      }

      return toOutcomeTrackingResult(tracking);
    });
  }
}
