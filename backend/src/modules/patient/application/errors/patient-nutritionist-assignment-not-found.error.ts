import { ApplicationError } from '../../../iam/application/errors/application-error.js';

type AssignmentLookupById = {
  kind: 'id';
  assignmentId: string;
};

type AssignmentLookupByPair = {
  kind: 'pair';
  tenantId: string;
  patientId: string;
  nutritionistId: string;
};

export class PatientNutritionistAssignmentNotFoundError extends ApplicationError {
  readonly code = 'PATIENT_NUTRITIONIST_ASSIGNMENT_NOT_FOUND' as const;

  constructor(readonly lookup: AssignmentLookupById | AssignmentLookupByPair) {
    super(
      lookup.kind === 'id'
        ? `Patient nutritionist assignment with id "${lookup.assignmentId}" was not found.`
        : `Patient nutritionist assignment for patient "${lookup.patientId}" and nutritionist "${lookup.nutritionistId}" in tenant "${lookup.tenantId}" was not found.`,
    );
    this.name = 'PatientNutritionistAssignmentNotFoundError';
  }
}
