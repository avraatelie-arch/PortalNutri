import type { PrismaClient } from '@prisma/client';
import type { PatientRepository } from '../../domain/repositories/patient-repository.js';
import type { Patient } from '../../domain/aggregates/patient.aggregate.js';
import type { PatientId } from '../../domain/value-objects/patient-id.js';
import type { TenantId } from '../../../iam/domain/value-objects/tenant-id.js';
import { toDomain, toPersistence } from '../prisma/prisma-patient.mapper.js';

export class PrismaPatientRepository implements PatientRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(patient: Patient): Promise<void> {
    const data = toPersistence(patient);

    await this.prisma.patient.upsert({
      where: { id: data.id },
      create: data,
      update: {
        fullName: data.fullName,
        birthDate: data.birthDate,
        gender: data.gender,
        phone: data.phone,
        email: data.email,
        status: data.status,
        updatedAt: data.updatedAt,
      },
    });
  }

  async findById(id: PatientId): Promise<Patient | null> {
    const record = await this.prisma.patient.findUnique({
      where: { id: id.toString() },
    });

    return record ? toDomain(record) : null;
  }

  async findByTenantId(tenantId: TenantId): Promise<Patient[]> {
    const records = await this.prisma.patient.findMany({
      where: { tenantId: tenantId.toString() },
    });

    return records.map(toDomain);
  }
}
