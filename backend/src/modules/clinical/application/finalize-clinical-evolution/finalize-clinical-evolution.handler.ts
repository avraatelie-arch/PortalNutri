import type { EventDispatcher } from '../../../../core/application/events/event-dispatcher.js';
import type { EvolutionFinalizationPolicy } from '../../domain/policies/evolution-finalization-policy.js';
import type { ClinicalEvolutionRepository } from '../../domain/repositories/clinical-evolution-repository.js';
import { toClinicalEvolutionResult } from '../clinical-evolution-result.js';
import { executeClinicalUseCase } from '../execute-clinical-use-case.js';
import { ClinicalEncounterCancelledForClinicalEvolutionError } from '../errors/clinical-encounter-cancelled-for-clinical-evolution.error.js';
import { loadTenantScopedClinicalEvolution } from '../load-tenant-scoped-clinical-evolution.js';
import { mapClinicalEvolutionDomainError } from '../map-clinical-evolution-domain-error.js';
import { persistAndDispatchClinicalEvolutionEvents } from '../persist-and-dispatch-clinical-evolution-events.js';
import type { ClinicalEncounterDirectoryPort } from '../ports/clinical-encounter-directory.port.js';
import type { Clock } from '../ports/clock.port.js';
import { FinalizeClinicalEvolutionCommand } from './finalize-clinical-evolution.command.js';

export class FinalizeClinicalEvolutionHandler {
  constructor(
    private readonly clinicalEvolutionRepository: ClinicalEvolutionRepository,
    private readonly clinicalEncounterDirectory: ClinicalEncounterDirectoryPort,
    private readonly finalizationPolicy: EvolutionFinalizationPolicy,
    private readonly clock: Clock,
    private readonly eventDispatcher: EventDispatcher,
  ) {}

  async execute(command: FinalizeClinicalEvolutionCommand) {
    return executeClinicalUseCase(async () => {
      const { tenantId, clinicalEvolutionId } = command.request;

      const evolution = await loadTenantScopedClinicalEvolution(
        this.clinicalEvolutionRepository,
        tenantId,
        clinicalEvolutionId,
      );

      const encounter = await this.clinicalEncounterDirectory.findByTenantAndId(
        tenantId,
        evolution.getClinicalEncounterId(),
      );

      if (encounter?.status === 'CANCELLED') {
        throw new ClinicalEncounterCancelledForClinicalEvolutionError(
          tenantId,
          evolution.getClinicalEncounterId(),
        );
      }

      try {
        evolution.finalize(this.clock.now(), this.finalizationPolicy);
      }
      catch (error) {
        mapClinicalEvolutionDomainError(
          tenantId,
          clinicalEvolutionId,
          'finalize',
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
