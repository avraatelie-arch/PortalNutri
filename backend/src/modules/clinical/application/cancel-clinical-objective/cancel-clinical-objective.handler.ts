import type { EventDispatcher } from '../../../../core/application/events/event-dispatcher.js';
import type { ClinicalObjectiveRepository } from '../../domain/repositories/clinical-objective-repository.js';
import { toClinicalObjectiveResult } from '../clinical-objective-result.js';
import { executeClinicalObjectiveUseCase } from '../execute-clinical-objective-use-case.js';
import { loadTenantScopedClinicalObjective } from '../load-tenant-scoped-clinical-objective.js';
import { mapClinicalObjectiveDomainError } from '../map-clinical-objective-domain-error.js';
import { persistAndDispatchClinicalObjectiveEvents } from '../persist-and-dispatch-clinical-objective-events.js';
import type { Clock } from '../ports/clock.port.js';
import { CancelClinicalObjectiveCommand } from './cancel-clinical-objective.command.js';

export class CancelClinicalObjectiveHandler {
  constructor(
    private readonly clinicalObjectiveRepository: ClinicalObjectiveRepository,
    private readonly clock: Clock,
    private readonly eventDispatcher: EventDispatcher,
  ) {}

  async execute(command: CancelClinicalObjectiveCommand) {
    return executeClinicalObjectiveUseCase(async () => {
      const { tenantId, clinicalObjectiveId } = command.request;

      const objective = await loadTenantScopedClinicalObjective(
        this.clinicalObjectiveRepository,
        tenantId,
        clinicalObjectiveId,
      );

      try {
        objective.cancel(this.clock.now());
      }
      catch (error) {
        mapClinicalObjectiveDomainError(
          tenantId,
          clinicalObjectiveId,
          'cancel',
          error,
        );
      }

      await persistAndDispatchClinicalObjectiveEvents(
        this.clinicalObjectiveRepository,
        this.eventDispatcher,
        objective,
      );

      return toClinicalObjectiveResult(objective);
    });
  }
}
