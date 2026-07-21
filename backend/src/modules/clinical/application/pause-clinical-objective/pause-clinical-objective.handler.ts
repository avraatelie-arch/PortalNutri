import type { EventDispatcher } from '../../../../core/application/events/event-dispatcher.js';
import type { ClinicalObjectiveRepository } from '../../domain/repositories/clinical-objective-repository.js';
import { toClinicalObjectiveResult } from '../clinical-objective-result.js';
import { executeClinicalObjectiveUseCase } from '../execute-clinical-objective-use-case.js';
import { loadTenantScopedClinicalObjective } from '../load-tenant-scoped-clinical-objective.js';
import { mapClinicalObjectiveDomainError } from '../map-clinical-objective-domain-error.js';
import { persistAndDispatchClinicalObjectiveEvents } from '../persist-and-dispatch-clinical-objective-events.js';
import type { Clock } from '../ports/clock.port.js';
import { PauseClinicalObjectiveCommand } from './pause-clinical-objective.command.js';

export class PauseClinicalObjectiveHandler {
  constructor(
    private readonly clinicalObjectiveRepository: ClinicalObjectiveRepository,
    private readonly clock: Clock,
    private readonly eventDispatcher: EventDispatcher,
  ) {}

  async execute(command: PauseClinicalObjectiveCommand) {
    return executeClinicalObjectiveUseCase(async () => {
      const { tenantId, clinicalObjectiveId } = command.request;

      const objective = await loadTenantScopedClinicalObjective(
        this.clinicalObjectiveRepository,
        tenantId,
        clinicalObjectiveId,
      );

      try {
        objective.pause(this.clock.now());
      }
      catch (error) {
        mapClinicalObjectiveDomainError(
          tenantId,
          clinicalObjectiveId,
          'pause',
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
