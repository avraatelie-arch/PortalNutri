import type { PrismaClient } from '@prisma/client';
import {
  decimalFromPrisma,
  formatClinicalDecimal,
} from '../../domain/value-objects/clinical-decimal-utils.js';
import type {
  AnthropometricAssessmentDirectoryEntry,
  AnthropometricAssessmentDirectoryPort,
} from '../../application/ports/anthropometric-assessment-directory.port.js';

export class PrismaAnthropometricAssessmentDirectoryAdapter
  implements AnthropometricAssessmentDirectoryPort
{
  constructor(private readonly prisma: PrismaClient) {}

  async findByTenantAndId(
    tenantId: string,
    anthropometricAssessmentId: string,
  ): Promise<AnthropometricAssessmentDirectoryEntry | null> {
    const record = await this.prisma.anthropometricAssessment.findFirst({
      where: {
        id: anthropometricAssessmentId,
        tenantId,
      },
      select: {
        id: true,
        tenantId: true,
        anamnesisId: true,
        patientId: true,
        weightKg: true,
      },
    });

    if (!record) {
      return null;
    }

    return {
      id: record.id,
      tenantId: record.tenantId,
      anamnesisId: record.anamnesisId,
      patientId: record.patientId,
      weightKg: formatClinicalDecimal(decimalFromPrisma(record.weightKg), 2),
    };
  }
}
