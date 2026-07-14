import type { EventDispatcher } from '../../../core/application/events/event-dispatcher.js';
import type { TenantRepository } from '../domain/repositories/tenant-repository.js';
import { ActivateTenantHandler } from '../application/activate-tenant/activate-tenant.handler.js';
import { CreateTenantHandler } from '../application/create-tenant/create-tenant.handler.js';
import { DeactivateTenantHandler } from '../application/deactivate-tenant/deactivate-tenant.handler.js';
import { FindTenantHandler } from '../application/find-tenant/find-tenant.handler.js';

export interface TenantFactoryDependencies {
  tenantRepository: TenantRepository;
  eventDispatcher: EventDispatcher;
}

export interface TenantHandlers {
  createTenantHandler: CreateTenantHandler;
  findTenantHandler: FindTenantHandler;
  activateTenantHandler: ActivateTenantHandler;
  deactivateTenantHandler: DeactivateTenantHandler;
}

export function createTenantHandlers({
  tenantRepository,
  eventDispatcher,
}: TenantFactoryDependencies): TenantHandlers {
  return {
    createTenantHandler: new CreateTenantHandler(
      tenantRepository,
      eventDispatcher,
    ),
    findTenantHandler: new FindTenantHandler(tenantRepository),
    activateTenantHandler: new ActivateTenantHandler(
      tenantRepository,
      eventDispatcher,
    ),
    deactivateTenantHandler: new DeactivateTenantHandler(
      tenantRepository,
      eventDispatcher,
    ),
  };
}
