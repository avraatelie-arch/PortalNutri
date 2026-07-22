import type { EventDispatcher } from '../../../../core/application/events/event-dispatcher.js';
import type { ClinicalEvolutionRepository } from '../../domain/repositories/clinical-evolution-repository.js';
import { toClinicalEvolutionResult } from '../clinical-evolution-result.js';
import { executeClinicalUseCase } from '../execute-clinical-use-case.js';
import { loadTenantScopedClinicalEvolution } from '../load-tenant-scoped-clinical-evolution.js';
import { mapClinicalEvolutionDomainError } from '../map-clinical-evolution-domain-error.js';
import { persistAndDispatchClinicalEvolutionEvents } from '../persist-and-dispatch-clinical-evolution-events.js';
import type { Clock } from '../ports/clock.port.js';
import { CancelClinicalEvolutionCommand } from './cancel-clinical-evolution.command.js';

export class CancelClinicalEvolutionHandler {
  constructor(
    private readonly clinicalEvolutionRepository: ClinicalEvolutionRepository,
    private readonly clock: Clock,
    private readonly eventDispatcher: EventDispatcher,
  ) {}

  async execute(command: CancelClinicalEvolutionCommand) {
    return executeClinicalUseCase(async () => {
      const { tenantId, clinicalEvolutionId } = command.request;

      const evolution = await loadTenantScopedClinicalEvolution(
        this.clinicalEvolutionRepository,
        tenantId,
        clinicalEvolutionId,
      );

      try {
        evolution.cancel(this.clock.now());
      }
      catch (error) {
        mapClinicalEvolutionDomainError(
          tenantId,
          clinicalEvolutionId,
          'cancel',
          error,
        );
      }

      await persistAndDispatchClinicalEvolutionEvents(
        this.clinicalEvolutionRepository,
        this.eventDispatcher,
        evolution,
      );

      return toClinicalEvolutionResult(evolution);
    });
  }
}
