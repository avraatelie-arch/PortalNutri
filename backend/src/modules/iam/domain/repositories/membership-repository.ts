import type { Membership } from '../aggregates/membership.aggregate.js';
import type { MembershipId } from '../value-objects/membership-id.js';
import type { PersonId } from '../value-objects/person-id.js';
import type { TenantId } from '../value-objects/tenant-id.js';

export interface MembershipRepository {
  save(membership: Membership): Promise<void>;
  findById(id: MembershipId): Promise<Membership | null>;
  findByPersonAndTenant(
    personId: PersonId,
    tenantId: TenantId,
  ): Promise<Membership | null>;
}
