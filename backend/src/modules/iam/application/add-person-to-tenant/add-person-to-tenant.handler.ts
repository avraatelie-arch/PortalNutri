import type { MembershipRepository } from '../../domain/repositories/membership-repository.js';
import type { PersonRepository } from '../../domain/repositories/person-repository.js';
import type { TenantRepository } from '../../domain/repositories/tenant-repository.js';
import { Membership } from '../../domain/aggregates/membership.aggregate.js';
import { PersonId } from '../../domain/value-objects/person-id.js';
import { TenantId } from '../../domain/value-objects/tenant-id.js';
import type { EventDispatcher } from '../../../../core/application/events/event-dispatcher.js';
import { executeMembershipUseCase } from '../execute-membership-use-case.js';
import { MembershipAlreadyExistsError } from '../errors/membership-already-exists.error.js';
import { PersonInactiveError } from '../errors/person-inactive.error.js';
import { PersonNotFoundError } from '../errors/person-not-found.error.js';
import { TenantInactiveError } from '../errors/tenant-inactive.error.js';
import { TenantNotFoundError } from '../errors/tenant-not-found.error.js';
import { AddPersonToTenantCommand } from './add-person-to-tenant.command.js';
import { toAddPersonToTenantResponse } from './add-person-to-tenant.response.js';

export class AddPersonToTenantHandler {
  constructor(
    private readonly membershipRepository: MembershipRepository,
    private readonly personRepository: PersonRepository,
    private readonly tenantRepository: TenantRepository,
    private readonly eventDispatcher: EventDispatcher,
  ) {}

  async execute(command: AddPersonToTenantCommand) {
    return executeMembershipUseCase(async () => {
      const personId = PersonId.create(command.request.personId);
      const tenantId = TenantId.create(command.request.tenantId);

      const person = await this.personRepository.findById(personId);

      if (!person) {
        throw new PersonNotFoundError(command.request.personId);
      }

      if (!person.isActive()) {
        throw new PersonInactiveError(command.request.personId);
      }

      const tenant = await this.tenantRepository.findById(tenantId);

      if (!tenant) {
        throw new TenantNotFoundError(command.request.tenantId);
      }

      if (!tenant.isActive()) {
        throw new TenantInactiveError(command.request.tenantId);
      }

      const existing = await this.membershipRepository.findByPersonAndTenant(
        personId,
        tenantId,
      );

      if (!existing) {
        const membership = Membership.create({ personId, tenantId });

        await this.membershipRepository.save(membership);
        await this.eventDispatcher.dispatch(membership.pullDomainEvents());

        return toAddPersonToTenantResponse(membership, 'CREATED');
      }

      if (existing.isRemoved()) {
        existing.reactivate();
        const events = existing.pullDomainEvents();

        await this.membershipRepository.save(existing);
        await this.eventDispatcher.dispatch(events);

        return toAddPersonToTenantResponse(existing, 'REACTIVATED');
      }

      throw new MembershipAlreadyExistsError(
        command.request.personId,
        command.request.tenantId,
      );
    });
  }
}
