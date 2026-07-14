import type { TenantRepository } from '../../domain/repositories/tenant-repository.js';
import { TenantId } from '../../domain/value-objects/tenant-id.js';
import type { EventDispatcher } from '../../../../core/application/events/event-dispatcher.js';
import { executeTenantUseCase } from '../execute-tenant-use-case.js';
import { TenantNotFoundError } from '../errors/tenant-not-found.error.js';
import { DeactivateTenantCommand } from './deactivate-tenant.command.js';
import { toDeactivateTenantResult } from './deactivate-tenant.result.js';

export class DeactivateTenantHandler {
  constructor(
    private readonly tenantRepository: TenantRepository,
    private readonly eventDispatcher: EventDispatcher,
  ) {}

  async execute(command: DeactivateTenantCommand) {
    return executeTenantUseCase(async () => {
      const tenant = await this.tenantRepository.findById(
        TenantId.create(command.tenantId),
      );

      if (!tenant) {
        throw new TenantNotFoundError(command.tenantId);
      }

      tenant.deactivate();
      const events = tenant.pullDomainEvents();

      if (events.length > 0) {
        await this.tenantRepository.save(tenant);
        await this.eventDispatcher.dispatch(events);
      }

      return toDeactivateTenantResult(tenant);
    });
  }
}
