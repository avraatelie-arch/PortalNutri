import type { PrismaClient } from '@prisma/client';
import type { Prescription } from '../../domain/aggregates/prescription.aggregate.js';
import type { PrescriptionRepository } from '../../domain/repositories/prescription-repository.js';
import type { PrescriptionId } from '../../domain/value-objects/prescription-id.js';
import type { PrescriptionStatus } from '../../domain/value-objects/prescription-status.js';
import {
  toDomain,
  toLinesPersistence,
  toPersistence,
} from '../prisma/prisma-prescription.mapper.js';
import {
  getLatestPrescriptionByEffectiveDate,
  sortPrescriptionsByEffectiveDate,
} from './prescription-sort.js';

export class PrismaPrescriptionRepository implements PrescriptionRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(prescription: Prescription): Promise<void> {
    const data = toPersistence(prescription);
    const lines = toLinesPersistence(prescription);

    await this.prisma.$transaction(async (tx) => {
      await tx.prescription.upsert({
        where: { id: data.id },
        create: data,
        update: {
          responsibleNutritionistId: data.responsibleNutritionistId,
          status: data.status,
          title: data.title,
          clinicalNotes: data.clinicalNotes,
          patientInstructions: data.patientInstructions,
          cancellationReason: data.cancellationReason,
          issuedAt: data.issuedAt,
          cancelledAt: data.cancelledAt,
          version: data.version,
          updatedAt: data.updatedAt,
        },
      });

      await tx.prescriptionLine.deleteMany({
        where: { prescriptionId: data.id },
      });

      if (lines.length > 0) {
        await tx.prescriptionLine.createMany({ data: lines });
      }
    });
  }

  async findByTenantAndId(
    tenantId: string,
    id: PrescriptionId,
  ): Promise<Prescription | null> {
    const record = await this.prisma.prescription.findFirst({
      where: {
        id: id.toString(),
        tenantId,
      },
      include: {
        lines: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    return record ? toDomain(record) : null;
  }

  async findByPatient(
    tenantId: string,
    patientId: string,
    statuses?: PrescriptionStatus[],
  ): Promise<Prescription[]> {
    const records = await this.prisma.prescription.findMany({
      where: {
        tenantId,
        patientId,
        ...(statuses && statuses.length > 0 ? { status: { in: statuses } } : {}),
      },
      include: {
        lines: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    return sortPrescriptionsByEffectiveDate(records.map(toDomain));
  }

  async findByResponsibleNutritionist(
    tenantId: string,
    nutritionistId: string,
  ): Promise<Prescription[]> {
    const records = await this.prisma.prescription.findMany({
      where: { tenantId, responsibleNutritionistId: nutritionistId },
      include: {
        lines: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    return sortPrescriptionsByEffectiveDate(records.map(toDomain));
  }

  async findByOriginClinicalEncounter(
    tenantId: string,
    clinicalEncounterId: string,
  ): Promise<Prescription[]> {
    const records = await this.prisma.prescription.findMany({
      where: { tenantId, originClinicalEncounterId: clinicalEncounterId },
      include: {
        lines: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    return sortPrescriptionsByEffectiveDate(records.map(toDomain));
  }

  async findByStatus(
    tenantId: string,
    status: PrescriptionStatus,
  ): Promise<Prescription[]> {
    const records = await this.prisma.prescription.findMany({
      where: { tenantId, status },
      include: {
        lines: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    return sortPrescriptionsByEffectiveDate(records.map(toDomain));
  }

  async findLatestByPatient(
    tenantId: string,
    patientId: string,
  ): Promise<Prescription | null> {
    const records = await this.prisma.prescription.findMany({
      where: { tenantId, patientId },
      include: {
        lines: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    return getLatestPrescriptionByEffectiveDate(records.map(toDomain));
  }
}
