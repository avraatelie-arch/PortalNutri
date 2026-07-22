import type { EventDispatcher } from '../../../../core/application/events/event-dispatcher.js';
import type { PrescriptionRepository } from '../../domain/repositories/prescription-repository.js';
import { executePrescriptionUseCase } from '../execute-prescription-use-case.js';
import { validateActiveNutritionistForPrescription } from '../prescription-creation-context.js';
import { createPrescriptionCreationContextErrors } from '../prescription-creation-context.errors.js';
import { loadTenantScopedPrescription } from '../load-tenant-scoped-prescription.js';
import { mapPrescriptionDomainError } from '../map-prescription-domain-error.js';
import { toPrescriptionResult } from '../prescription-result.js';
import { persistAndDispatchPrescriptionEvents } from '../persist-and-dispatch-prescription-events.js';
import type { Clock } from '../ports/clock.port.js';
import type { NutritionistDirectoryPort } from '../ports/nutritionist-directory.port.js';
import { ChangePrescriptionResponsibleNutritionistCommand } from './change-prescription-responsible-nutritionist.command.js';

export class ChangePrescriptionResponsibleNutritionistHandler {
  private readonly creationContextErrors = createPrescriptionCreationContextErrors();

  constructor(
    private readonly prescriptionRepository: PrescriptionRepository,
    private readonly nutritionistDirectory: NutritionistDirectoryPort,
    private readonly clock: Clock,
    private readonly eventDispatcher: EventDispatcher,
  ) {}

  async execute(command: ChangePrescriptionResponsibleNutritionistCommand) {
    return executePrescriptionUseCase(async () => {
      const { tenantId, prescriptionId, responsibleNutritionistId } = command.request;

      await validateActiveNutritionistForPrescription({
        nutritionistDirectory: this.nutritionistDirectory,
        tenantId,
        nutritionistId: responsibleNutritionistId,
        errors: this.creationContextErrors,
      });

      const prescription = await loadTenantScopedPrescription(
        this.prescriptionRepository,
        tenantId,
        prescriptionId,
      );

      let changed: boolean;

      try {
        changed = prescription.changeResponsibleNutritionist(
          responsibleNutritionistId,
          this.clock.now(),
        );
      }
      catch (error) {
        mapPrescriptionDomainError(
          tenantId,
          prescriptionId,
          'changeResponsibleNutritionist',
          error,
        );
      }

      if (changed) {
        await persistAndDispatchPrescriptionEvents(
          this.prescriptionRepository,
          this.eventDispatcher,
          prescription,
        );
      }

      return toPrescriptionResult(prescription);
    });
  }
}
