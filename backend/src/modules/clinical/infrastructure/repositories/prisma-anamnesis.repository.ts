import type { PrismaClient } from '@prisma/client';
import type { AnamnesisRepository } from '../../domain/repositories/anamnesis-repository.js';
import type { Anamnesis } from '../../domain/aggregates/anamnesis.aggregate.js';
import type { AnamnesisId } from '../../domain/value-objects/anamnesis-id.js';
import { toDomain, toPersistence } from '../prisma/prisma-anamnesis.mapper.js';

export class PrismaAnamnesisRepository implements AnamnesisRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(anamnesis: Anamnesis): Promise<void> {
    const data = toPersistence(anamnesis);

    await this.prisma.anamnesis.upsert({
      where: { id: data.id },
      create: data,
      update: {
        status: data.status,
        version: data.version,
        chiefComplaint: data.chiefComplaint,
        currentHistory: data.currentHistory,
        medicalHistory: data.medicalHistory,
        familyHistory: data.familyHistory,
        gastrointestinalHistory: data.gastrointestinalHistory,
        dietaryHistory: data.dietaryHistory,
        lifestyleHistory: data.lifestyleHistory,
        medicationHistory: data.medicationHistory,
        supplementHistory: data.supplementHistory,
        allergiesAndIntolerances: data.allergiesAndIntolerances,
        observations: data.observations,
        completedAt: data.completedAt,
        updatedAt: data.updatedAt,
      },
    });
  }

  async findByTenantAndId(
    tenantId: string,
    id: AnamnesisId,
  ): Promise<Anamnesis | null> {
    const record = await this.prisma.anamnesis.findFirst({
      where: {
        id: id.toString(),
        tenantId,
      },
    });

    return record ? toDomain(record) : null;
  }

  async existsByClinicalEncounter(
    tenantId: string,
    clinicalEncounterId: string,
  ): Promise<boolean> {
    const count = await this.prisma.anamnesis.count({
      where: {
        tenantId,
        clinicalEncounterId,
      },
    });

    return count > 0;
  }

  async findByClinicalEncounter(
    tenantId: string,
    clinicalEncounterId: string,
  ): Promise<Anamnesis | null> {
    const record = await this.prisma.anamnesis.findFirst({
      where: {
        tenantId,
        clinicalEncounterId,
      },
    });

    return record ? toDomain(record) : null;
  }

  async findByPatient(
    tenantId: string,
    patientId: string,
  ): Promise<Anamnesis[]> {
    const records = await this.prisma.anamnesis.findMany({
      where: { tenantId, patientId },
      orderBy: { createdAt: 'desc' },
    });

    return records.map(toDomain);
  }

  async findByNutritionist(
    tenantId: string,
    nutritionistId: string,
  ): Promise<Anamnesis[]> {
    const records = await this.prisma.anamnesis.findMany({
      where: { tenantId, nutritionistId },
      orderBy: { createdAt: 'desc' },
    });

    return records.map(toDomain);
  }
}
