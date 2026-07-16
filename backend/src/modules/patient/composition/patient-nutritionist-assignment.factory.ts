import type { EventDispatcher } from '../../../core/application/events/event-dispatcher.js';
import type { TenantRepository } from '../../iam/domain/repositories/tenant-repository.js';
import type { PatientRepository } from '../domain/repositories/patient-repository.js';
import type { PatientNutritionistAssignmentRepository } from '../domain/repositories/patient-nutritionist-assignment-repository.js';
import type { NutritionistDirectoryPort } from '../application/ports/nutritionist-directory.port.js';
import { AssignNutritionistToPatientHandler } from '../application/assign-nutritionist-to-patient/assign-nutritionist-to-patient.handler.js';
import { RemoveNutritionistFromPatientHandler } from '../application/remove-nutritionist-from-patient/remove-nutritionist-from-patient.handler.js';
import { FindPatientNutritionistAssignmentHandler } from '../application/find-patient-nutritionist-assignment/find-patient-nutritionist-assignment.handler.js';

export interface PatientNutritionistAssignmentFactoryDependencies {
  assignmentRepository: PatientNutritionistAssignmentRepository;
  patientRepository: PatientRepository;
  nutritionistDirectory: NutritionistDirectoryPort;
  tenantRepository: TenantRepository;
  eventDispatcher: EventDispatcher;
}

export interface PatientNutritionistAssignmentHandlers {
  assignNutritionistToPatientHandler: AssignNutritionistToPatientHandler;
  removeNutritionistFromPatientHandler: RemoveNutritionistFromPatientHandler;
  findPatientNutritionistAssignmentHandler: FindPatientNutritionistAssignmentHandler;
}

export function createPatientNutritionistAssignmentHandlers({
  assignmentRepository,
  patientRepository,
  nutritionistDirectory,
  tenantRepository,
  eventDispatcher,
}: PatientNutritionistAssignmentFactoryDependencies): PatientNutritionistAssignmentHandlers {
  return {
    assignNutritionistToPatientHandler: new AssignNutritionistToPatientHandler(
      assignmentRepository,
      patientRepository,
      nutritionistDirectory,
      tenantRepository,
      eventDispatcher,
    ),
    removeNutritionistFromPatientHandler:
      new RemoveNutritionistFromPatientHandler(
        assignmentRepository,
        eventDispatcher,
      ),
    findPatientNutritionistAssignmentHandler:
      new FindPatientNutritionistAssignmentHandler(assignmentRepository),
  };
}
