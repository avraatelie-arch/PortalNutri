import type { ClinicalEncounterRepository } from '../../domain/repositories/clinical-encounter-repository.js';
import type { Clock } from '../ports/clock.port.js';
import { ClinicalNotes } from '../../domain/value-objects/clinical-notes.js';
import type { EventDispatcher } from '../../../../core/application/events/event-dispatcher.js';
import { executeClinicalUseCase } from '../execute-clinical-use-case.js';
import { loadTenantScopedClinicalEncounter } from '../load-tenant-scoped-clinical-encounter.js';
import { persistAndDispatchClinicalEvents } from '../persist-and-dispatch-clinical-events.js';
import { toClinicalEncounterResult } from '../clinical-encounter-result.js';
import { UpdateClinicalNotesCommand } from './update-clinical-notes.command.js';

export class UpdateClinicalNotesHandler {
  constructor(
    private readonly encounterRepository: ClinicalEncounterRepository,
    private readonly clock: Clock,
    private readonly eventDispatcher: EventDispatcher,
  ) {}

  async execute(command: UpdateClinicalNotesCommand) {
    return executeClinicalUseCase(async () => {
      const encounter = await loadTenantScopedClinicalEncounter(
        this.encounterRepository,
        command.request.tenantId,
        command.request.encounterId,
      );

      encounter.updateNotes(
        ClinicalNotes.create(command.request.notes),
        this.clock.now(),
      );
      await persistAndDispatchClinicalEvents(
        this.encounterRepository,
        this.eventDispatcher,
        encounter,
      );

      return toClinicalEncounterResult(encounter);
    });
  }
}
