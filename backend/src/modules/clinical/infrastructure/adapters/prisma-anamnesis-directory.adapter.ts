import type { PrismaClient } from '@prisma/client';
import { AnamnesisStatus as PrismaAnamnesisStatus } from '@prisma/client';
import type {
  AnamnesisDirectoryEntry,
  AnamnesisDirectoryPort,
  AnamnesisDirectoryStatus,
} from '../../application/ports/anamnesis-directory.port.js';

export class PrismaAnamnesisDirectoryAdapter implements AnamnesisDirectoryPort {
  constructor(private readonly prisma: PrismaClient) {}

  async findByTenantAndId(
    tenantId: string,
    anamnesisId: string,
  ): Promise<AnamnesisDirectoryEntry | null> {
    const record = await this.prisma.anamnesis.findFirst({
      where: {
        id: anamnesisId,
        tenantId,
      },
      select: {
        id: true,
        tenantId: true,
        clinicalEncounterId: true,
        patientId: true,
        nutritionistId: true,
        status: true,
        version: true,
      },
    });

    if (!record) {
      return null;
    }

    return {
      id: record.id,
      tenantId: record.tenantId,
      clinicalEncounterId: record.clinicalEncounterId,
      patientId: record.patientId,
      nutritionistId: record.nutritionistId,
      status: toDirectoryStatus(record.status),
      version: record.version,
    };
  }
}

function toDirectoryStatus(status: PrismaAnamnesisStatus): AnamnesisDirectoryStatus {
  return status as AnamnesisDirectoryStatus;
}
