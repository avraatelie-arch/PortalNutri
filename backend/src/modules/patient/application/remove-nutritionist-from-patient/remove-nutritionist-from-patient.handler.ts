import type { PatientNutritionistAssignmentRepository } from '../../domain/repositories/patient-nutritionist-assignment-repository.js';
import { TenantId } from '../../../iam/domain/value-objects/tenant-id.js';
import { PatientId } from '../../domain/value-objects/patient-id.js';
import type { EventDispatcher } from '../../../../core/application/events/event-dispatcher.js';
import { PatientNutritionistAssignmentNotFoundError } from '../errors/patient-nutritionist-assignment-not-found.error.js';
import { PatientNutritionistTenantMismatchError } from '../errors/patient-nutritionist-tenant-mismatch.error.js';
import { executePatientNutritionistAssignmentUseCase } from '../execute-patient-nutritionist-assignment-use-case.js';
import { RemoveNutritionistFromPatientCommand } from './remove-nutritionist-from-patient.command.js';
import { toRemoveNutritionistFromPatientResult } from './remove-nutritionist-from-patient.result.js';

export class RemoveNutritionistFromPatientHandler {
  constructor(
    private readonly assignmentRepository: PatientNutritionistAssignmentRepository,
    private readonly eventDispatcher: EventDispatcher,
  ) {}

  async execute(command: RemoveNutritionistFromPatientCommand) {
    return executePatientNutritionistAssignmentUseCase(async () => {
      const tenantId = TenantId.create(command.request.tenantId);
      const patientId = PatientId.create(command.request.patientId);

      const assignment =
        await this.assignmentRepository.findByPatientAndNutritionist(
          tenantId,
          patientId,
          command.request.nutritionistId,
        );

      if (!assignment) {
        throw new PatientNutritionistAssignmentNotFoundError({
          kind: 'pair',
          tenantId: command.request.tenantId,
          patientId: command.request.patientId,
          nutritionistId: command.request.nutritionistId,
        });
      }

      if (!assignment.getTenantId().equals(tenantId)) {
        throw new PatientNutritionistTenantMismatchError(
          command.request.tenantId,
          'assignment',
          assignment.getId().toString(),
        );
      }

      if (assignment.isRemoved()) {
        return toRemoveNutritionistFromPatientResult(assignment);
      }

      assignment.remove();
      const events = assignment.pullDomainEvents();

      await this.assignmentRepository.save(assignment);
      await this.eventDispatcher.dispatch(events);

      return toRemoveNutritionistFromPatientResult(assignment);
    });
  }
}
