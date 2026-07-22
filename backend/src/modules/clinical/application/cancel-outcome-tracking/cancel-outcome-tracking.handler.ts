import type { EventDispatcher } from '../../../../core/application/events/event-dispatcher.js';
import type { OutcomeTrackingRepository } from '../../domain/repositories/outcome-tracking-repository.js';
import { executeOutcomeTrackingUseCase } from '../execute-outcome-tracking-use-case.js';
import { loadTenantScopedOutcomeTracking } from '../load-tenant-scoped-outcome-tracking.js';
import { mapOutcomeTrackingDomainError } from '../map-outcome-tracking-domain-error.js';
import { toOutcomeTrackingResult } from '../outcome-tracking-result.js';
import { persistAndDispatchOutcomeTrackingEvents } from '../persist-and-dispatch-outcome-tracking-events.js';
import type { Clock } from '../ports/clock.port.js';
import { CancelOutcomeTrackingCommand } from './cancel-outcome-tracking.command.js';

export class CancelOutcomeTrackingHandler {
  constructor(
    private readonly outcomeTrackingRepository: OutcomeTrackingRepository,
    private readonly clock: Clock,
    private readonly eventDispatcher: EventDispatcher,
  ) {}

  async execute(command: CancelOutcomeTrackingCommand) {
    return executeOutcomeTrackingUseCase(async () => {
      const { tenantId, outcomeTrackingId } = command.request;

      const tracking = await loadTenantScopedOutcomeTracking(
        this.outcomeTrackingRepository,
        tenantId,
        outcomeTrackingId,
      );

      try {
        tracking.cancel(this.clock.now());
      }
      catch (error) {
        mapOutcomeTrackingDomainError(
          tenantId,
          outcomeTrackingId,
          'cancel',
          error,
        );
      }

      await persistAndDispatchOutcomeTrackingEvents(
        this.outcomeTrackingRepository,
        this.eventDispatcher,
        tracking,
      );

      return toOutcomeTrackingResult(tracking);
    });
  }
}
