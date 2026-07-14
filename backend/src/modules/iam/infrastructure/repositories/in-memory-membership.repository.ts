import type { MembershipRepository } from '../../domain/repositories/membership-repository.js';
import type { Membership } from '../../domain/aggregates/membership.aggregate.js';
import type { MembershipId } from '../../domain/value-objects/membership-id.js';
import type { PersonId } from '../../domain/value-objects/person-id.js';
import type { TenantId } from '../../domain/value-objects/tenant-id.js';

export class InMemoryMembershipRepository implements MembershipRepository {
  private readonly memberships = new Map<string, Membership>();

  async save(membership: Membership): Promise<void> {
    this.memberships.set(membership.getId().toString(), membership);
  }

  async findById(id: MembershipId): Promise<Membership | null> {
    return this.memberships.get(id.toString()) ?? null;
  }

  async findByPersonAndTenant(
    personId: PersonId,
    tenantId: TenantId,
  ): Promise<Membership | null> {
    for (const membership of this.memberships.values()) {
      if (
        membership.getPersonId().equals(personId)
        && membership.getTenantId().equals(tenantId)
      ) {
        return membership;
      }
    }

    return null;
  }
}
