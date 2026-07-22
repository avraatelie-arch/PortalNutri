import type { EventDispatcher } from '../../../../core/application/events/event-dispatcher.js';
import type { OutcomeTrackingRepository } from '../../domain/repositories/outcome-tracking-repository.js';
import { AdherenceFactor } from '../../domain/value-objects/adherence-factor.js';
import { OutcomeAssessment } from '../../domain/value-objects/outcome-assessment.js';
import {
  OutcomeClinicalNotes,
  ProfessionalRationale,
} from '../../domain/value-objects/outcome-assessment-text.js';
import { executeOutcomeTrackingUseCase } from '../execute-outcome-tracking-use-case.js';
import { loadTenantScopedOutcomeTracking } from '../load-tenant-scoped-outcome-tracking.js';
import { mapOutcomeTrackingDomainError } from '../map-outcome-tracking-domain-error.js';
import { toOutcomeTrackingResult } from '../outcome-tracking-result.js';
import { persistAndDispatchOutcomeTrackingEvents } from '../persist-and-dispatch-outcome-tracking-events.js';
import type { Clock } from '../ports/clock.port.js';
import { EditOutcomeTrackingCommand } from './edit-outcome-tracking.command.js';

export class EditOutcomeTrackingHandler {
  constructor(
    private readonly outcomeTrackingRepository: OutcomeTrackingRepository,
    private readonly clock: Clock,
    private readonly eventDispatcher: EventDispatcher,
  ) {}

  async execute(command: EditOutcomeTrackingCommand) {
    return executeOutcomeTrackingUseCase(async () => {
      const {
        tenantId,
        outcomeTrackingId,
        outcomeAssessment,
        adherenceFactor,
        professionalRationale,
        clinicalNotes,
        evaluatedAt,
      } = command.request;

      const tracking = await loadTenantScopedOutcomeTracking(
        this.outcomeTrackingRepository,
        tenantId,
        outcomeTrackingId,
      );

      const now = this.clock.now();
      let changed = false;

      try {
        changed = tracking.edit(
          {
            outcomeAssessment:
              outcomeAssessment !== undefined
                ? outcomeAssessment === null
                  ? null
                  : OutcomeAssessment.parse(outcomeAssessment)
                : undefined,
            adherenceFactor:
              adherenceFactor !== undefined
                ? adherenceFactor === null
                  ? null
                  : AdherenceFactor.parse(adherenceFactor)
                : undefined,
            professionalRationale:
              professionalRationale !== undefined
                ? ProfessionalRationale.create(professionalRationale)
                : undefined,
            clinicalNotes:
              clinicalNotes !== undefined
                ? OutcomeClinicalNotes.create(clinicalNotes)
                : undefined,
            evaluatedAt:
              evaluatedAt !== undefined
                ? evaluatedAt === null
                  ? null
                  : new Date(evaluatedAt)
                : undefined,
          },
          now,
        );
      }
      catch (error) {
        mapOutcomeTrackingDomainError(
          tenantId,
          outcomeTrackingId,
          'edit',
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
