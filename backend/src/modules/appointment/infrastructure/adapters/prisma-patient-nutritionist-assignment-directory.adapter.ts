import type { PrismaClient } from '@prisma/client';
import type { PatientNutritionistAssignmentDirectoryPort } from '../../application/ports/patient-nutritionist-assignment-directory.port.js';

export class PrismaPatientNutritionistAssignmentDirectoryAdapter
  implements PatientNutritionistAssignmentDirectoryPort
{
  constructor(private readonly prisma: PrismaClient) {}

  async hasActiveAssignment(
    tenantId: string,
    patientId: string,
    nutritionistId: string,
  ): Promise<boolean> {
    const record = await this.prisma.patientNutritionistAssignment.findFirst({
      where: {
        tenantId,
        patientId,
        nutritionistId,
        status: 'ACTIVE',
      },
      select: { id: true },
    });

    return record !== null;
  }
}
