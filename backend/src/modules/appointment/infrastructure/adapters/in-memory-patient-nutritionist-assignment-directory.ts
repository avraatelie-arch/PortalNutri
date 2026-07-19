import type { PatientNutritionistAssignmentDirectoryPort } from '../../application/ports/patient-nutritionist-assignment-directory.port.js';

export class InMemoryPatientNutritionistAssignmentDirectory
  implements PatientNutritionistAssignmentDirectoryPort
{
  private readonly assignments = new Set<string>();

  seed(tenantId: string, patientId: string, nutritionistId: string): void {
    this.assignments.add(this.key(tenantId, patientId, nutritionistId));
  }

  async hasActiveAssignment(
    tenantId: string,
    patientId: string,
    nutritionistId: string,
  ): Promise<boolean> {
    return this.assignments.has(this.key(tenantId, patientId, nutritionistId));
  }

  private key(
    tenantId: string,
    patientId: string,
    nutritionistId: string,
  ): string {
    return `${tenantId}:${patientId}:${nutritionistId}`;
  }
}
