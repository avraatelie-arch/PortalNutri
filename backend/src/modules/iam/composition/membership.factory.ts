import type { EventDispatcher } from '../../../core/application/events/event-dispatcher.js';
import type { MembershipRepository } from '../domain/repositories/membership-repository.js';
import type { PersonRepository } from '../domain/repositories/person-repository.js';
import type { TenantRepository } from '../domain/repositories/tenant-repository.js';
import { AddPersonToTenantHandler } from '../application/add-person-to-tenant/add-person-to-tenant.handler.js';
import { FindMembershipHandler } from '../application/find-membership/find-membership.handler.js';
import { RemovePersonFromTenantHandler } from '../application/remove-person-from-tenant/remove-person-from-tenant.handler.js';

export interface MembershipFactoryDependencies {
  membershipRepository: MembershipRepository;
  personRepository: PersonRepository;
  tenantRepository: TenantRepository;
  eventDispatcher: EventDispatcher;
}

export interface MembershipHandlers {
  addPersonToTenantHandler: AddPersonToTenantHandler;
  removePersonFromTenantHandler: RemovePersonFromTenantHandler;
  findMembershipHandler: FindMembershipHandler;
}

export function createMembershipHandlers({
  membershipRepository,
  personRepository,
  tenantRepository,
  eventDispatcher,
}: MembershipFactoryDependencies): MembershipHandlers {
  return {
    addPersonToTenantHandler: new AddPersonToTenantHandler(
      membershipRepository,
      personRepository,
      tenantRepository,
      eventDispatcher,
    ),
    removePersonFromTenantHandler: new RemovePersonFromTenantHandler(
      membershipRepository,
      eventDispatcher,
    ),
    findMembershipHandler: new FindMembershipHandler(membershipRepository),
  };
}
