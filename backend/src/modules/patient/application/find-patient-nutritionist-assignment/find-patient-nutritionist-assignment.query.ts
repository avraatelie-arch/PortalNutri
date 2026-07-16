export interface FindPatientNutritionistAssignmentRequest {
  assignmentId: string;
}

export class FindPatientNutritionistAssignmentQuery {
  constructor(readonly request: FindPatientNutritionistAssignmentRequest) {}
}
