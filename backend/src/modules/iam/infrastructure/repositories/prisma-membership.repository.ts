import type { PrismaClient } from '@prisma/client';
import type { MembershipRepository } from '../../domain/repositories/membership-repository.js';
import type { Membership } from '../../domain/aggregates/membership.aggregate.js';
import type { MembershipId } from '../../domain/value-objects/membership-id.js';
import type { PersonId } from '../../domain/value-objects/person-id.js';
import type { TenantId } from '../../domain/value-objects/tenant-id.js';
import { toDomain, toPersistence } from '../prisma/prisma-membership.mapper.js';

export class PrismaMembershipRepository implements MembershipRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(membership: Membership): Promise<void> {
    const data = toPersistence(membership);

    await this.prisma.membership.upsert({
      where: { id: data.id },
      create: data,
      update: {
        status: data.status,
        reactivatedAt: data.reactivatedAt,
        removedAt: data.removedAt,
      },
    });
  }

  async findById(id: MembershipId): Promise<Membership | null> {
    const record = await this.prisma.membership.findUnique({
      where: { id: id.toString() },
    });

    return record ? toDomain(record) : null;
  }

  async findByPersonAndTenant(
    personId: PersonId,
    tenantId: TenantId,
  ): Promise<Membership | null> {
    const record = await this.prisma.membership.findUnique({
      where: {
        personId_tenantId: {
          personId: personId.toString(),
          tenantId: tenantId.toString(),
        },
      },
    });

    return record ? toDomain(record) : null;
  }
}
