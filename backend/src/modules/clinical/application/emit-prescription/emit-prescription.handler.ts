import type { EventDispatcher } from '../../../../core/application/events/event-dispatcher.js';
import type { PrescriptionRepository } from '../../domain/repositories/prescription-repository.js';
import { executePrescriptionUseCase } from '../execute-prescription-use-case.js';
import { loadTenantScopedPrescription } from '../load-tenant-scoped-prescription.js';
import { mapPrescriptionDomainError } from '../map-prescription-domain-error.js';
import { toPrescriptionResult } from '../prescription-result.js';
import { persistAndDispatchPrescriptionEvents } from '../persist-and-dispatch-prescription-events.js';
import type { Clock } from '../ports/clock.port.js';
import { EmitPrescriptionCommand } from './emit-prescription.command.js';

export class EmitPrescriptionHandler {
  constructor(
    private readonly prescriptionRepository: PrescriptionRepository,
    private readonly clock: Clock,
    private readonly eventDispatcher: EventDispatcher,
  ) {}

  async execute(command: EmitPrescriptionCommand) {
    return executePrescriptionUseCase(async () => {
      const { tenantId, prescriptionId } = command.request;

      const prescription = await loadTenantScopedPrescription(
        this.prescriptionRepository,
        tenantId,
        prescriptionId,
      );

      try {
        prescription.emit(this.clock.now());
      }
      catch (error) {
        mapPrescriptionDomainError(tenantId, prescriptionId, 'emit', error);
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
