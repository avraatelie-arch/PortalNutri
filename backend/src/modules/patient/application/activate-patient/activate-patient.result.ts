import type { Patient } from '../../domain/aggregates/patient.aggregate.js';
import type { PatientStatus } from '../../domain/value-objects/patient-status.js';

export interface ActivatePatientResult {
  id: string;
  tenantId: string;
  fullName: string;
  birthDate: string;
  gender: string;
  phone: string | null;
  email: string | null;
  status: PatientStatus;
  createdAt: string;
  updatedAt: string;
}

export function toActivatePatientResult(
  patient: Patient,
): ActivatePatientResult {
  return {
    id: patient.getId().toString(),
    tenantId: patient.getTenantId().toString(),
    fullName: patient.getFullName().toString(),
    birthDate: patient.getBirthDate().toString(),
    gender: patient.getGender().toString(),
    phone: patient.getPhone()?.toString() ?? null,
    email: patient.getEmail()?.toString() ?? null,
    status: patient.getStatus(),
    createdAt: patient.getCreatedAt().toISOString(),
    updatedAt: patient.getUpdatedAt().toISOString(),
  };
}
