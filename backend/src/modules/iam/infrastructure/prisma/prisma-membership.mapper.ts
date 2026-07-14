import type { Membership as MembershipRecord } from '@prisma/client';
import { MembershipStatus as PrismaMembershipStatus } from '@prisma/client';
import { Membership } from '../../domain/aggregates/membership.aggregate.js';
import { MembershipId } from '../../domain/value-objects/membership-id.js';
import { MembershipStatus } from '../../domain/value-objects/membership-status.js';
import { PersonId } from '../../domain/value-objects/person-id.js';
import { TenantId } from '../../domain/value-objects/tenant-id.js';

export type MembershipPersistenceInput = {
  id: string;
  personId: string;
  tenantId: string;
  status: PrismaMembershipStatus;
  createdAt: Date;
  reactivatedAt: Date | null;
  removedAt: Date | null;
};

export function toPersistence(membership: Membership): MembershipPersistenceInput {
  return {
    id: membership.getId().toString(),
    personId: membership.getPersonId().toString(),
    tenantId: membership.getTenantId().toString(),
    status: toPrismaMembershipStatus(membership.getStatus()),
    createdAt: membership.getCreatedAt(),
    reactivatedAt: membership.getReactivatedAt(),
    removedAt: membership.getRemovedAt(),
  };
}

export function toDomain(record: MembershipRecord): Membership {
  return Membership.reconstitute({
    id: MembershipId.create(record.id),
    personId: PersonId.create(record.personId),
    tenantId: TenantId.create(record.tenantId),
    status: toDomainMembershipStatus(record.status),
    createdAt: record.createdAt,
    reactivatedAt: record.reactivatedAt,
    removedAt: record.removedAt,
  });
}

function toPrismaMembershipStatus(
  status: MembershipStatus,
): PrismaMembershipStatus {
  return status as PrismaMembershipStatus;
}

function toDomainMembershipStatus(
  status: PrismaMembershipStatus,
): MembershipStatus {
  return status as MembershipStatus;
}
