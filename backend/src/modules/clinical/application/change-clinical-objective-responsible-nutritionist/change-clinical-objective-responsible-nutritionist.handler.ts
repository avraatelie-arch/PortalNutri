import type { EventDispatcher } from '../../../../core/application/events/event-dispatcher.js';
import type { ClinicalObjectiveRepository } from '../../domain/repositories/clinical-objective-repository.js';
import { validateActiveNutritionistForClinicalObjective } from '../clinical-objective-creation-context.js';
import { createClinicalObjectiveCreationContextErrors } from '../clinical-objective-creation-context.errors.js';
import { toClinicalObjectiveResult } from '../clinical-objective-result.js';
import { executeClinicalObjectiveUseCase } from '../execute-clinical-objective-use-case.js';
import { loadTenantScopedClinicalObjective } from '../load-tenant-scoped-clinical-objective.js';
import { mapClinicalObjectiveDomainError } from '../map-clinical-objective-domain-error.js';
import { persistAndDispatchClinicalObjectiveEvents } from '../persist-and-dispatch-clinical-objective-events.js';
import type { Clock } from '../ports/clock.port.js';
import type { NutritionistDirectoryPort } from '../ports/nutritionist-directory.port.js';
import { ChangeClinicalObjectiveResponsibleNutritionistCommand } from './change-clinical-objective-responsible-nutritionist.command.js';

export class ChangeClinicalObjectiveResponsibleNutritionistHandler {
  private readonly creationContextErrors =
    createClinicalObjectiveCreationContextErrors();

  constructor(
    private readonly clinicalObjectiveRepository: ClinicalObjectiveRepository,
    private readonly nutritionistDirectory: NutritionistDirectoryPort,
    private readonly clock: Clock,
    private readonly eventDispatcher: EventDispatcher,
  ) {}

  async execute(command: ChangeClinicalObjectiveResponsibleNutritionistCommand) {
    return executeClinicalObjectiveUseCase(async () => {
      const { tenantId, clinicalObjectiveId, responsibleNutritionistId } =
        command.request;

      await validateActiveNutritionistForClinicalObjective({
        nutritionistDirectory: this.nutritionistDirectory,
        tenantId,
        nutritionistId: responsibleNutritionistId,
        errors: this.creationContextErrors,
      });

      const objective = await loadTenantScopedClinicalObjective(
        this.clinicalObjectiveRepository,
        tenantId,
        clinicalObjectiveId,
      );

      let changed: boolean;

      try {
        changed = objective.changeResponsibleNutritionist(
          responsibleNutritionistId,
          this.clock.now(),
        );
      }
      catch (error) {
        mapClinicalObjectiveDomainError(
          tenantId,
          clinicalObjectiveId,
          'changeResponsibleNutritionist',
          error,
        );
      }

      if (changed) {
        await persistAndDispatchClinicalObjectiveEvents(
          this.clinicalObjectiveRepository,
          this.eventDispatcher,
          objective,
        );
      }

      return toClinicalObjectiveResult(objective);
    });
  }
}
