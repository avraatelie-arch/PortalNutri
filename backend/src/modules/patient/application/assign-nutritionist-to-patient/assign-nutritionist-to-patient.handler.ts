import type { TenantRepository } from '../../../iam/domain/repositories/tenant-repository.js';
import type { PatientRepository } from '../../domain/repositories/patient-repository.js';
import type { PatientNutritionistAssignmentRepository } from '../../domain/repositories/patient-nutritionist-assignment-repository.js';
import type { NutritionistDirectoryPort } from '../ports/nutritionist-directory.port.js';
import { TenantId } from '../../../iam/domain/value-objects/tenant-id.js';
import { PatientId } from '../../domain/value-objects/patient-id.js';
import { PatientNutritionistAssignment } from '../../domain/aggregates/patient-nutritionist-assignment.aggregate.js';
import { PatientNutritionistAssignmentRole } from '../../domain/value-objects/patient-nutritionist-assignment-role.js';
import type { EventDispatcher } from '../../../../core/application/events/event-dispatcher.js';
import { TenantInactiveError } from '../../../iam/application/errors/tenant-inactive.error.js';
import { TenantNotFoundError } from '../../../iam/application/errors/tenant-not-found.error.js';
import { PatientNotFoundError } from '../errors/patient-not-found.error.js';
import { PatientInactiveError } from '../errors/patient-inactive.error.js';
import { NutritionistNotFoundForPatientAssignmentError } from '../errors/nutritionist-not-found-for-patient-assignment.error.js';
import { NutritionistInactiveForPatientAssignmentError } from '../errors/nutritionist-inactive-for-patient-assignment.error.js';
import { PatientNutritionistTenantMismatchError } from '../errors/patient-nutritionist-tenant-mismatch.error.js';
import { PatientNutritionistAssignmentAlreadyExistsError } from '../errors/patient-nutritionist-assignment-already-exists.error.js';
import { PatientPrimaryNutritionistAlreadyAssignedError } from '../errors/patient-primary-nutritionist-already-assigned.error.js';
import { PatientNutritionistAssignmentRoleMismatchError } from '../errors/patient-nutritionist-assignment-role-mismatch.error.js';
import { executePatientNutritionistAssignmentUseCase } from '../execute-patient-nutritionist-assignment-use-case.js';
import { AssignNutritionistToPatientCommand } from './assign-nutritionist-to-patient.command.js';
import { toAssignNutritionistToPatientResult } from './assign-nutritionist-to-patient.result.js';

export class AssignNutritionistToPatientHandler {
  constructor(
    private readonly assignmentRepository: PatientNutritionistAssignmentRepository,
    private readonly patientRepository: PatientRepository,
    private readonly nutritionistDirectory: NutritionistDirectoryPort,
    private readonly tenantRepository: TenantRepository,
    private readonly eventDispatcher: EventDispatcher,
  ) {}

  async execute(command: AssignNutritionistToPatientCommand) {
    return executePatientNutritionistAssignmentUseCase(async () => {
      const tenantId = TenantId.create(command.request.tenantId);
      const patientId = PatientId.create(command.request.patientId);
      const role = PatientNutritionistAssignmentRole.create(command.request.role);

      const tenant = await this.tenantRepository.findById(tenantId);

      if (!tenant) {
        throw new TenantNotFoundError(command.request.tenantId);
      }

      if (!tenant.isActive()) {
        throw new TenantInactiveError(command.request.tenantId);
      }

      const patient = await this.patientRepository.findById(patientId);

      if (!patient) {
        throw new PatientNotFoundError(command.request.patientId);
      }

      if (!patient.getTenantId().equals(tenantId)) {
        throw new PatientNutritionistTenantMismatchError(
          command.request.tenantId,
          'patient',
          command.request.patientId,
        );
      }

      if (!patient.isActive()) {
        throw new PatientInactiveError(command.request.patientId);
      }

      const nutritionist = await this.nutritionistDirectory.findById(
        command.request.nutritionistId,
      );

      if (!nutritionist) {
        throw new NutritionistNotFoundForPatientAssignmentError(
          command.request.nutritionistId,
        );
      }

      if (nutritionist.tenantId !== command.request.tenantId) {
        throw new PatientNutritionistTenantMismatchError(
          command.request.tenantId,
          'nutritionist',
          command.request.nutritionistId,
        );
      }

      if (nutritionist.status !== 'ACTIVE') {
        throw new NutritionistInactiveForPatientAssignmentError(
          command.request.nutritionistId,
        );
      }

      const existing =
        await this.assignmentRepository.findByPatientAndNutritionist(
          tenantId,
          patientId,
          command.request.nutritionistId,
        );

      if (!existing) {
        await this.ensurePrimaryAvailability(
          tenantId,
          patientId,
          command.request.nutritionistId,
          role,
        );

        const assignment = PatientNutritionistAssignment.create({
          tenantId,
          patientId,
          nutritionistId: command.request.nutritionistId,
          role,
        });

        await this.assignmentRepository.save(assignment);
        await this.eventDispatcher.dispatch(assignment.pullDomainEvents());

        return toAssignNutritionistToPatientResult(assignment, 'CREATED');
      }

      if (existing.isActive()) {
        throw new PatientNutritionistAssignmentAlreadyExistsError(
          command.request.tenantId,
          command.request.patientId,
          command.request.nutritionistId,
        );
      }

      if (!existing.getRole().equals(role)) {
        throw new PatientNutritionistAssignmentRoleMismatchError(
          command.request.tenantId,
          command.request.patientId,
          command.request.nutritionistId,
          existing.getRole().toString(),
          role.toString(),
        );
      }

      await this.ensurePrimaryAvailability(
        tenantId,
        patientId,
        command.request.nutritionistId,
        role,
        existing.getId().toString(),
      );

      existing.reactivate();
      const events = existing.pullDomainEvents();

      await this.assignmentRepository.save(existing);
      await this.eventDispatcher.dispatch(events);

      return toAssignNutritionistToPatientResult(existing, 'REACTIVATED');
    });
  }

  private async ensurePrimaryAvailability(
    tenantId: TenantId,
    patientId: PatientId,
    nutritionistId: string,
    role: PatientNutritionistAssignmentRole,
    excludingAssignmentId?: string,
  ): Promise<void> {
    if (!role.isPrimary()) {
      return;
    }

    const activePrimary =
      await this.assignmentRepository.findActivePrimaryByPatient(
        tenantId,
        patientId,
      );

    if (
      activePrimary &&
      activePrimary.getId().toString() !== excludingAssignmentId
    ) {
      throw new PatientPrimaryNutritionistAlreadyAssignedError(
        tenantId.toString(),
        patientId.toString(),
        nutritionistId,
      );
    }
  }
}
