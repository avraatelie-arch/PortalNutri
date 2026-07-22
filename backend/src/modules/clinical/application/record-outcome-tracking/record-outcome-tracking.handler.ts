import type { EventDispatcher } from '../../../../core/application/events/event-dispatcher.js';
import type { OutcomeRecordingPolicy } from '../../domain/policies/outcome-recording-policy.js';
import type { OutcomeTrackingRepository } from '../../domain/repositories/outcome-tracking-repository.js';
import { executeOutcomeTrackingUseCase } from '../execute-outcome-tracking-use-case.js';
import { ClinicalEncounterCancelledForOutcomeTrackingError } from '../errors/clinical-encounter-cancelled-for-outcome-tracking.error.js';
import { loadTenantScopedOutcomeTracking } from '../load-tenant-scoped-outcome-tracking.js';
import { mapOutcomeTrackingDomainError } from '../map-outcome-tracking-domain-error.js';
import { toOutcomeTrackingResult } from '../outcome-tracking-result.js';
import { persistAndDispatchOutcomeTrackingEvents } from '../persist-and-dispatch-outcome-tracking-events.js';
import type { ClinicalEncounterDirectoryPort } from '../ports/clinical-encounter-directory.port.js';
import type { Clock } from '../ports/clock.port.js';
import { RecordOutcomeTrackingCommand } from './record-outcome-tracking.command.js';

export class RecordOutcomeTrackingHandler {
  constructor(
    private readonly outcomeTrackingRepository: OutcomeTrackingRepository,
    private readonly clinicalEncounterDirectory: ClinicalEncounterDirectoryPort,
    private readonly recordingPolicy: OutcomeRecordingPolicy,
    private readonly clock: Clock,
    private readonly eventDispatcher: EventDispatcher,
  ) {}

  async execute(command: RecordOutcomeTrackingCommand) {
    return executeOutcomeTrackingUseCase(async () => {
      const { tenantId, outcomeTrackingId } = command.request;

      const tracking = await loadTenantScopedOutcomeTracking(
        this.outcomeTrackingRepository,
        tenantId,
        outcomeTrackingId,
      );

      const originClinicalEncounterId = tracking.getOriginClinicalEncounterId();

      if (originClinicalEncounterId) {
        const encounter = await this.clinicalEncounterDirectory.findByTenantAndId(
          tenantId,
          originClinicalEncounterId,
        );

        if (encounter?.status === 'CANCELLED') {
          throw new ClinicalEncounterCancelledForOutcomeTrackingError(
            tenantId,
            originClinicalEncounterId,
          );
        }
      }

      try {
        tracking.record(this.clock.now(), this.recordingPolicy);
      }
      catch (error) {
        mapOutcomeTrackingDomainError(
          tenantId,
          outcomeTrackingId,
          'record',
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
