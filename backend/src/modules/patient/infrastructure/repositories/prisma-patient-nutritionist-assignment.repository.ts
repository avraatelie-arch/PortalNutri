import type { PrismaClient } from '@prisma/client';
import {
  PatientNutritionistAssignmentRole as PrismaRole,
  PatientNutritionistAssignmentStatus as PrismaStatus,
} from '@prisma/client';
import type { PatientNutritionistAssignmentRepository } from '../../domain/repositories/patient-nutritionist-assignment-repository.js';
import type { PatientNutritionistAssignment } from '../../domain/aggregates/patient-nutritionist-assignment.aggregate.js';
import type { PatientNutritionistAssignmentId } from '../../domain/value-objects/patient-nutritionist-assignment-id.js';
import type { PatientId } from '../../domain/value-objects/patient-id.js';
import type { TenantId } from '../../../iam/domain/value-objects/tenant-id.js';
import { toDomain, toPersistence } from '../prisma/prisma-patient-nutritionist-assignment.mapper.js';

export class PrismaPatientNutritionistAssignmentRepository
  implements PatientNutritionistAssignmentRepository
{
  constructor(private readonly prisma: PrismaClient) {}

  async save(assignment: PatientNutritionistAssignment): Promise<void> {
    const data = toPersistence(assignment);

    await this.prisma.patientNutritionistAssignment.upsert({
      where: { id: data.id },
      create: data,
      update: {
        status: data.status,
        reactivatedAt: data.reactivatedAt,
        removedAt: data.removedAt,
      },
    });
  }

  async findById(
    id: PatientNutritionistAssignmentId,
  ): Promise<PatientNutritionistAssignment | null> {
    const record = await this.prisma.patientNutritionistAssignment.findUnique({
      where: { id: id.toString() },
    });

    return record ? toDomain(record) : null;
  }

  async findByPatientAndNutritionist(
    tenantId: TenantId,
    patientId: PatientId,
    nutritionistId: string,
  ): Promise<PatientNutritionistAssignment | null> {
    const record = await this.prisma.patientNutritionistAssignment.findFirst({
      where: {
        tenantId: tenantId.toString(),
        patientId: patientId.toString(),
        nutritionistId,
      },
    });

    return record ? toDomain(record) : null;
  }

  async findActivePrimaryByPatient(
    tenantId: TenantId,
    patientId: PatientId,
  ): Promise<PatientNutritionistAssignment | null> {
    const record = await this.prisma.patientNutritionistAssignment.findFirst({
      where: {
        tenantId: tenantId.toString(),
        patientId: patientId.toString(),
        status: PrismaStatus.ACTIVE,
        role: PrismaRole.PRIMARY,
      },
    });

    return record ? toDomain(record) : null;
  }

  async findActiveByPatient(
    tenantId: TenantId,
    patientId: PatientId,
  ): Promise<PatientNutritionistAssignment[]> {
    const records = await this.prisma.patientNutritionistAssignment.findMany({
      where: {
        tenantId: tenantId.toString(),
        patientId: patientId.toString(),
        status: PrismaStatus.ACTIVE,
      },
    });

    return records.map(toDomain);
  }

  async findActiveByNutritionist(
    tenantId: TenantId,
    nutritionistId: string,
  ): Promise<PatientNutritionistAssignment[]> {
    const records = await this.prisma.patientNutritionistAssignment.findMany({
      where: {
        tenantId: tenantId.toString(),
        nutritionistId,
        status: PrismaStatus.ACTIVE,
      },
    });

    return records.map(toDomain);
  }
}
