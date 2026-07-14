import type { Membership } from '../../domain/aggregates/membership.aggregate.js';
import type { MembershipStatus } from '../../domain/value-objects/membership-status.js';

export interface FindMembershipResult {
  id: string;
  personId: string;
  tenantId: string;
  status: MembershipStatus;
  createdAt: string;
  reactivatedAt: string | null;
  removedAt: string | null;
}

export function toFindMembershipResult(
  membership: Membership,
): FindMembershipResult {
  return {
    id: membership.getId().toString(),
    personId: membership.getPersonId().toString(),
    tenantId: membership.getTenantId().toString(),
    status: membership.getStatus(),
    createdAt: membership.getCreatedAt().toISOString(),
    reactivatedAt: membership.getReactivatedAt()?.toISOString() ?? null,
    removedAt: membership.getRemovedAt()?.toISOString() ?? null,
  };
}
