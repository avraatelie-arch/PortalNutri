import type { PrismaClient } from '@prisma/client';
import { ClinicalEncounterStatus as PrismaStatus } from '@prisma/client';
import type { ClinicalEncounterRepository } from '../../domain/repositories/clinical-encounter-repository.js';
import type { ClinicalEncounter } from '../../domain/aggregates/clinical-encounter.aggregate.js';
import type { ClinicalEncounterId } from '../../domain/value-objects/clinical-encounter-id.js';
import { toDomain, toPersistence } from '../prisma/prisma-clinical-encounter.mapper.js';

export class PrismaClinicalEncounterRepository
  implements ClinicalEncounterRepository
{
  constructor(private readonly prisma: PrismaClient) {}

  async save(encounter: ClinicalEncounter): Promise<void> {
    const data = toPersistence(encounter);

    await this.prisma.clinicalEncounter.upsert({
      where: { id: data.id },
      create: data,
      update: {
        status: data.status,
        notes: data.notes,
        finishedAt: data.finishedAt,
        updatedAt: data.updatedAt,
      },
    });
  }

  async findByTenantAndId(
    tenantId: string,
    id: ClinicalEncounterId,
  ): Promise<ClinicalEncounter | null> {
    const record = await this.prisma.clinicalEncounter.findFirst({
      where: {
        id: id.toString(),
        tenantId,
      },
    });

    return record ? toDomain(record) : null;
  }

  async findByAppointment(
    tenantId: string,
    appointmentId: string,
  ): Promise<ClinicalEncounter | null> {
    const record = await this.prisma.clinicalEncounter.findFirst({
      where: {
        tenantId,
        appointmentId,
      },
    });

    return record ? toDomain(record) : null;
  }

  async findByPatient(
    tenantId: string,
    patientId: string,
  ): Promise<ClinicalEncounter[]> {
    const records = await this.prisma.clinicalEncounter.findMany({
      where: { tenantId, patientId },
      orderBy: { startedAt: 'desc' },
    });

    return records.map(toDomain);
  }

  async findByNutritionist(
    tenantId: string,
    nutritionistId: string,
  ): Promise<ClinicalEncounter[]> {
    const records = await this.prisma.clinicalEncounter.findMany({
      where: { tenantId, nutritionistId },
      orderBy: { startedAt: 'desc' },
    });

    return records.map(toDomain);
  }

  async findOpenEncounter(
    tenantId: string,
    patientId: string,
    nutritionistId: string,
  ): Promise<ClinicalEncounter | null> {
    const record = await this.prisma.clinicalEncounter.findFirst({
      where: {
        tenantId,
        patientId,
        nutritionistId,
        status: PrismaStatus.OPEN,
      },
    });

    return record ? toDomain(record) : null;
  }
}
