import type { PrismaClient } from '@prisma/client';
import type {
  PatientDirectoryEntry,
  PatientDirectoryPort,
} from '../../application/ports/patient-directory.port.js';

export class PrismaPatientDirectoryAdapter implements PatientDirectoryPort {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<PatientDirectoryEntry | null> {
    const record = await this.prisma.patient.findUnique({
      where: { id },
      select: { id: true, tenantId: true, status: true },
    });

    return record
      ? {
          id: record.id,
          tenantId: record.tenantId,
          status: record.status,
        }
      : null;
  }
}
