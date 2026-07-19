import type { ClinicalEncounterRepository } from '../../domain/repositories/clinical-encounter-repository.js';
import type { Clock } from '../ports/clock.port.js';
import type { EventDispatcher } from '../../../../core/application/events/event-dispatcher.js';
import { executeClinicalUseCase } from '../execute-clinical-use-case.js';
import { loadTenantScopedClinicalEncounter } from '../load-tenant-scoped-clinical-encounter.js';
import { persistAndDispatchClinicalEvents } from '../persist-and-dispatch-clinical-events.js';
import { toClinicalEncounterResult } from '../clinical-encounter-result.js';
import { CancelClinicalEncounterCommand } from './cancel-clinical-encounter.command.js';

export class CancelClinicalEncounterHandler {
  constructor(
    private readonly encounterRepository: ClinicalEncounterRepository,
    private readonly clock: Clock,
    private readonly eventDispatcher: EventDispatcher,
  ) {}

  async execute(command: CancelClinicalEncounterCommand) {
    return executeClinicalUseCase(async () => {
      const encounter = await loadTenantScopedClinicalEncounter(
        this.encounterRepository,
        command.request.tenantId,
        command.request.encounterId,
      );

      encounter.cancel(this.clock.now());
      await persistAndDispatchClinicalEvents(
        this.encounterRepository,
        this.eventDispatcher,
        encounter,
      );

      return toClinicalEncounterResult(encounter);
    });
  }
}
