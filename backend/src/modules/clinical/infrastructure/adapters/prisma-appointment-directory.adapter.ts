import type { PrismaClient } from '@prisma/client';
import type {
  AppointmentDirectoryEntry,
  AppointmentDirectoryPort,
} from '../../application/ports/appointment-directory.port.js';

export class PrismaAppointmentDirectoryAdapter
  implements AppointmentDirectoryPort
{
  constructor(private readonly prisma: PrismaClient) {}

  async findByTenantAndId(
    tenantId: string,
    appointmentId: string,
  ): Promise<AppointmentDirectoryEntry | null> {
    const record = await this.prisma.appointment.findFirst({
      where: {
        id: appointmentId,
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

    return record
      ? {
          id: record.id,
          tenantId: record.tenantId,
          patientId: record.patientId,
          nutritionistId: record.nutritionistId,
          status: record.status,
        }
      : null;
  }
}
