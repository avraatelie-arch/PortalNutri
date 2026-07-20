import type { PrismaClient } from '@prisma/client';
import type {
  PatientClinicalDirectoryEntry,
  PatientClinicalDirectoryPort,
  PatientClinicalDirectoryStatus,
} from '../../application/ports/patient-clinical-directory.port.js';

export class PrismaPatientClinicalDirectoryAdapter
  implements PatientClinicalDirectoryPort
{
  constructor(private readonly prisma: PrismaClient) {}

  async findByTenantAndId(
    tenantId: string,
    patientId: string,
  ): Promise<PatientClinicalDirectoryEntry | null> {
    const record = await this.prisma.patient.findFirst({
      where: {
        id: patientId,
        tenantId,
      },
      select: {
        id: true,
        tenantId: true,
        status: true,
        birthDate: true,
      },
    });

    if (!record) {
      return null;
    }

    return {
      id: record.id,
      tenantId: record.tenantId,
      status: record.status as PatientClinicalDirectoryStatus,
      birthDate: record.birthDate,
    };
  }
}
