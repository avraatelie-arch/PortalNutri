import type { EventDispatcher } from '../../../../core/application/events/event-dispatcher.js';
import type { PrescriptionRepository } from '../../domain/repositories/prescription-repository.js';
import { PrescriptionCancellationReason } from '../../domain/value-objects/prescription-cancellation-reason.js';
import { executePrescriptionUseCase } from '../execute-prescription-use-case.js';
import { loadTenantScopedPrescription } from '../load-tenant-scoped-prescription.js';
import { mapPrescriptionDomainError } from '../map-prescription-domain-error.js';
import { toPrescriptionResult } from '../prescription-result.js';
import { persistAndDispatchPrescriptionEvents } from '../persist-and-dispatch-prescription-events.js';
import type { Clock } from '../ports/clock.port.js';
import { CancelPrescriptionCommand } from './cancel-prescription.command.js';

export class CancelPrescriptionHandler {
  constructor(
    private readonly prescriptionRepository: PrescriptionRepository,
    private readonly clock: Clock,
    private readonly eventDispatcher: EventDispatcher,
  ) {}

  async execute(command: CancelPrescriptionCommand) {
    return executePrescriptionUseCase(async () => {
      const { tenantId, prescriptionId, cancellationReason } = command.request;

      const prescription = await loadTenantScopedPrescription(
        this.prescriptionRepository,
        tenantId,
        prescriptionId,
      );

      try {
        prescription.cancel(
          {
            cancellationReason:
              cancellationReason !== undefined && cancellationReason !== null
                ? PrescriptionCancellationReason.create(cancellationReason)
                : undefined,
          },
          this.clock.now(),
        );
      }
      catch (error) {
        mapPrescriptionDomainError(tenantId, prescriptionId, 'cancel', error);
      }

      await persistAndDispatchPrescriptionEvents(
        this.prescriptionRepository,
        this.eventDispatcher,
        prescription,
      );

      return toPrescriptionResult(prescription);
    });
  }
}
