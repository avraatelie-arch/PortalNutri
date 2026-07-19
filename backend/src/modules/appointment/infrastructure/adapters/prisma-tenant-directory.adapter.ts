import type { PrismaClient } from '@prisma/client';
import type {
  TenantDirectoryEntry,
  TenantDirectoryPort,
} from '../../application/ports/tenant-directory.port.js';

export class PrismaTenantDirectoryAdapter implements TenantDirectoryPort {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<TenantDirectoryEntry | null> {
    const record = await this.prisma.tenant.findUnique({
      where: { id },
      select: { id: true, status: true },
    });

    return record ? { id: record.id, status: record.status } : null;
  }
}
