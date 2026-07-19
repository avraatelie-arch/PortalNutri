export interface PatientNutritionistAssignmentDirectoryPort {
  hasActiveAssignment(
    tenantId: string,
    patientId: string,
    nutritionistId: string,
  ): Promise<boolean>;
}
