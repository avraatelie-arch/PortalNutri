import type { PatientRepository } from '../../domain/repositories/patient-repository.js';
import type { Patient } from '../../domain/aggregates/patient.aggregate.js';
import type { PatientId } from '../../domain/value-objects/patient-id.js';
import type { TenantId } from '../../../iam/domain/value-objects/tenant-id.js';

export class InMemoryPatientRepository implements PatientRepository {
  private readonly patients = new Map<string, Patient>();

  async save(patient: Patient): Promise<void> {
    this.patients.set(patient.getId().toString(), patient);
  }

  async findById(id: PatientId): Promise<Patient | null> {
    return this.patients.get(id.toString()) ?? null;
  }

  async findByTenantId(tenantId: TenantId): Promise<Patient[]> {
    const patients: Patient[] = [];

    for (const patient of this.patients.values()) {
      if (patient.getTenantId().equals(tenantId)) {
        patients.push(patient);
      }
    }

    return patients;
  }
}
