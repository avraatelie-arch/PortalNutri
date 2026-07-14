import type { TenantRepository } from '../../domain/repositories/tenant-repository.js';
import { TenantId } from '../../domain/value-objects/tenant-id.js';
import type { EventDispatcher } from '../../../../core/application/events/event-dispatcher.js';
import { executeTenantUseCase } from '../execute-tenant-use-case.js';
import { TenantNotFoundError } from '../errors/tenant-not-found.error.js';
import { ActivateTenantCommand } from './activate-tenant.command.js';
import { toActivateTenantResult } from './activate-tenant.result.js';

export class ActivateTenantHandler {
  constructor(
    private readonly tenantRepository: TenantRepository,
    private readonly eventDispatcher: EventDispatcher,
  ) {}

  async execute(command: ActivateTenantCommand) {
    return executeTenantUseCase(async () => {
      const tenant = await this.tenantRepository.findById(
        TenantId.create(command.tenantId),
      );

      if (!tenant) {
        throw new TenantNotFoundError(command.tenantId);
      }

      tenant.activate();
      const events = tenant.pullDomainEvents();

      if (events.length > 0) {
        await this.tenantRepository.save(tenant);
        await this.eventDispatcher.dispatch(events);
      }

      return toActivateTenantResult(tenant);
    });
  }
}
