import type { MembershipRepository } from '../../domain/repositories/membership-repository.js';
import { PersonId } from '../../domain/value-objects/person-id.js';
import { TenantId } from '../../domain/value-objects/tenant-id.js';
import type { EventDispatcher } from '../../../../core/application/events/event-dispatcher.js';
import { executeMembershipUseCase } from '../execute-membership-use-case.js';
import { MembershipNotFoundError } from '../errors/membership-not-found.error.js';
import { RemovePersonFromTenantCommand } from './remove-person-from-tenant.command.js';
import { toRemovePersonFromTenantResult } from './remove-person-from-tenant.result.js';

export class RemovePersonFromTenantHandler {
  constructor(
    private readonly membershipRepository: MembershipRepository,
    private readonly eventDispatcher: EventDispatcher,
  ) {}

  async execute(command: RemovePersonFromTenantCommand) {
    return executeMembershipUseCase(async () => {
      const personId = PersonId.create(command.request.personId);
      const tenantId = TenantId.create(command.request.tenantId);

      const membership = await this.membershipRepository.findByPersonAndTenant(
        personId,
        tenantId,
      );

      if (!membership) {
        throw new MembershipNotFoundError(
          undefined,
          command.request.personId,
          command.request.tenantId,
        );
      }

      membership.remove();
      const events = membership.pullDomainEvents();

      if (events.length > 0) {
        await this.membershipRepository.save(membership);
        await this.eventDispatcher.dispatch(events);
      }

      return toRemovePersonFromTenantResult(membership);
    });
  }
}
