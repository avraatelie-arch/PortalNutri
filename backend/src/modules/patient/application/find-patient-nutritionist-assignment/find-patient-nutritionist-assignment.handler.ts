import type { PatientNutritionistAssignmentRepository } from '../../domain/repositories/patient-nutritionist-assignment-repository.js';
import { PatientNutritionistAssignmentId } from '../../domain/value-objects/patient-nutritionist-assignment-id.js';
import { PatientNutritionistAssignmentNotFoundError } from '../errors/patient-nutritionist-assignment-not-found.error.js';
import { executePatientNutritionistAssignmentUseCase } from '../execute-patient-nutritionist-assignment-use-case.js';
import { FindPatientNutritionistAssignmentQuery } from './find-patient-nutritionist-assignment.query.js';
import type { FindPatientNutritionistAssignmentResult } from './find-patient-nutritionist-assignment.result.js';

export class FindPatientNutritionistAssignmentHandler {
  constructor(
    private readonly assignmentRepository: PatientNutritionistAssignmentRepository,
  ) {}

  async execute(
    query: FindPatientNutritionistAssignmentQuery,
  ): Promise<FindPatientNutritionistAssignmentResult> {
    return executePatientNutritionistAssignmentUseCase(async () => {
      const assignmentId = PatientNutritionistAssignmentId.create(
        query.request.assignmentId,
      );

      const assignment = await this.assignmentRepository.findById(assignmentId);

      if (!assignment) {
        throw new PatientNutritionistAssignmentNotFoundError({
          kind: 'id',
          assignmentId: query.request.assignmentId,
        });
      }

      return {
        id: assignment.getId().toString(),
        tenantId: assignment.getTenantId().toString(),
        patientId: assignment.getPatientId().toString(),
        nutritionistId: assignment.getNutritionistId(),
        role: assignment.getRole().toString(),
        status: assignment.getStatus(),
        createdAt: assignment.getCreatedAt().toISOString(),
        reactivatedAt: assignment.getReactivatedAt()?.toISOString() ?? null,
        removedAt: assignment.getRemovedAt()?.toISOString() ?? null,
      };
    });
  }
}
