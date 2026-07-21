import type { EventDispatcher } from '../../../../core/application/events/event-dispatcher.js';
import type { ClinicalObjectiveRepository } from '../../domain/repositories/clinical-objective-repository.js';
import { parseClinicalObjectivePriority } from '../../domain/value-objects/clinical-objective-priority.js';
import { ClinicalObjectiveTitle } from '../../domain/value-objects/clinical-objective-title.js';
import { ClinicalRationale } from '../../domain/value-objects/clinical-rationale.js';
import { SuccessCriteria } from '../../domain/value-objects/success-criteria.js';
import { toClinicalObjectiveResult } from '../clinical-objective-result.js';
import { executeClinicalObjectiveUseCase } from '../execute-clinical-objective-use-case.js';
import { loadTenantScopedClinicalObjective } from '../load-tenant-scoped-clinical-objective.js';
import { mapClinicalObjectiveDomainError } from '../map-clinical-objective-domain-error.js';
import { persistAndDispatchClinicalObjectiveEvents } from '../persist-and-dispatch-clinical-objective-events.js';
import type { Clock } from '../ports/clock.port.js';
import { EditClinicalObjectiveCommand } from './edit-clinical-objective.command.js';

export class EditClinicalObjectiveHandler {
  constructor(
    private readonly clinicalObjectiveRepository: ClinicalObjectiveRepository,
    private readonly clock: Clock,
    private readonly eventDispatcher: EventDispatcher,
  ) {}

  async execute(command: EditClinicalObjectiveCommand) {
    return executeClinicalObjectiveUseCase(async () => {
      const {
        tenantId,
        clinicalObjectiveId,
        title,
        clinicalRationale,
        successCriteria,
        priority,
        targetDate,
      } = command.request;

      const objective = await loadTenantScopedClinicalObjective(
        this.clinicalObjectiveRepository,
        tenantId,
        clinicalObjectiveId,
      );

      let changedFields: string[];

      try {
        changedFields = objective.edit(
          {
            title: title !== undefined ? ClinicalObjectiveTitle.create(title) : undefined,
            clinicalRationale:
              clinicalRationale !== undefined
                ? ClinicalRationale.create(clinicalRationale)
                : undefined,
            successCriteria:
              successCriteria !== undefined
                ? SuccessCriteria.create(successCriteria)
                : undefined,
            priority: priority ? parseClinicalObjectivePriority(priority) : undefined,
            targetDate,
          },
          this.clock.now(),
        );
      }
      catch (error) {
        mapClinicalObjectiveDomainError(
          tenantId,
          clinicalObjectiveId,
          'edit',
          error,
        );
      }

      if (changedFields.length > 0) {
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
