import type { PrismaClient } from '@prisma/client';
import type {
  NutritionistDirectoryEntry,
  NutritionistDirectoryPort,
} from '../../application/ports/nutritionist-directory.port.js';

export class PrismaNutritionistDirectoryAdapter implements NutritionistDirectoryPort {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<NutritionistDirectoryEntry | null> {
    const record = await this.prisma.nutritionist.findUnique({
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
