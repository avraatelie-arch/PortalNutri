export interface AnthropometricAssessmentDirectoryEntry {
  id: string;
  tenantId: string;
  anamnesisId: string;
  patientId: string;
  weightKg: string;
}

export interface AnthropometricAssessmentDirectoryPort {
  findByTenantAndId(
    tenantId: string,
    anthropometricAssessmentId: string,
  ): Promise<AnthropometricAssessmentDirectoryEntry | null>;
}
