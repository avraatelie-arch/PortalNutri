import type { EventDispatcher } from '../../../../core/application/events/event-dispatcher.js';
import type { ClinicalEvolutionRepository } from '../../domain/repositories/clinical-evolution-repository.js';
import { validateActiveNutritionistForClinicalEvolution } from '../clinical-evolution-creation-context.js';
import { createClinicalEvolutionNutritionistValidationErrors } from '../clinical-evolution-creation-context.errors.js';
import { toClinicalEvolutionResult } from '../clinical-evolution-result.js';
import { executeClinicalUseCase } from '../execute-clinical-use-case.js';
import { loadTenantScopedClinicalEvolution } from '../load-tenant-scoped-clinical-evolution.js';
import { mapClinicalEvolutionDomainError } from '../map-clinical-evolution-domain-error.js';
import { persistAndDispatchClinicalEvolutionEvents } from '../persist-and-dispatch-clinical-evolution-events.js';
import type { Clock } from '../ports/clock.port.js';
import type { NutritionistDirectoryPort } from '../ports/nutritionist-directory.port.js';
import { ChangeClinicalEvolutionResponsibleNutritionistCommand } from './change-clinical-evolution-responsible-nutritionist.command.js';

export class ChangeClinicalEvolutionResponsibleNutritionistHandler {
  private readonly nutritionistValidationErrors =
    createClinicalEvolutionNutritionistValidationErrors();

  constructor(
    private readonly clinicalEvolutionRepository: ClinicalEvolutionRepository,
    private readonly nutritionistDirectory: NutritionistDirectoryPort,
    private readonly clock: Clock,
    private readonly eventDispatcher: EventDispatcher,
  ) {}

  async execute(command: ChangeClinicalEvolutionResponsibleNutritionistCommand) {
    return executeClinicalUseCase(async () => {
      const { tenantId, clinicalEvolutionId, responsibleNutritionistId } =
        command.request;

      await validateActiveNutritionistForClinicalEvolution({
        nutritionistDirectory: this.nutritionistDirectory,
        tenantId,
        nutritionistId: responsibleNutritionistId,
        errors: this.nutritionistValidationErrors,
      });

      const evolution = await loadTenantScopedClinicalEvolution(
        this.clinicalEvolutionRepository,
        tenantId,
        clinicalEvolutionId,
      );

      let changed: boolean;

      try {
        changed = evolution.changeResponsibleNutritionist(
          responsibleNutritionistId,
          this.clock.now(),
        );
      }
      catch (error) {
        mapClinicalEvolutionDomainError(
          tenantId,
          clinicalEvolutionId,
          'changeResponsibleNutritionist',
          error,
        );
      }

      if (changed) {
        await persistAndDispatchClinicalEvolutionEvents(
          this.clinicalEvolutionRepository,
          this.eventDispatcher,
          evolution,
        );
      }

      return toClinicalEvolutionResult(evolution);
    });
  }
}
