import type { PrismaClient } from '@prisma/client';
import { ClinicalEncounterStatus as PrismaStatus } from '@prisma/client';
import type {
  ClinicalEncounterDirectoryEntry,
  ClinicalEncounterDirectoryPort,
  ClinicalEncounterDirectoryStatus,
} from '../../application/ports/clinical-encounter-directory.port.js';

export class PrismaClinicalEncounterDirectoryAdapter
  implements ClinicalEncounterDirectoryPort
{
  constructor(private readonly prisma: PrismaClient) {}

  async findByTenantAndId(
    tenantId: string,
    clinicalEncounterId: string,
  ): Promise<ClinicalEncounterDirectoryEntry | null> {
    const record = await this.prisma.clinicalEncounter.findFirst({
      where: {
        id: clinicalEncounterId,
        tenantId,
      },
      select: {
        id: true,
        tenantId: true,
        patientId: true,
        nutritionistId: true,
        status: true,
      },
    });

    if (!record) {
      return null;
    }

    return {
      id: record.id,
      tenantId: record.tenantId,
      patientId: record.patientId,
      nutritionistId: record.nutritionistId,
      status: toDirectoryStatus(record.status),
    };
  }
}

function toDirectoryStatus(
  status: PrismaStatus,
): ClinicalEncounterDirectoryStatus {
  return status as ClinicalEncounterDirectoryStatus;
}
