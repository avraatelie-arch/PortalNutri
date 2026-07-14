import type { TenantRepository } from '../../domain/repositories/tenant-repository.js';
import { Tenant } from '../../domain/aggregates/tenant.aggregate.js';
import { TenantName } from '../../domain/value-objects/tenant-name.js';
import { TenantSlug } from '../../domain/value-objects/tenant-slug.js';
import type { EventDispatcher } from '../../../../core/application/events/event-dispatcher.js';
import { executeTenantUseCase } from '../execute-tenant-use-case.js';
import { TenantSlugAlreadyExistsError } from '../errors/tenant-slug-already-exists.error.js';
import { CreateTenantCommand } from './create-tenant.command.js';
import { CreateTenantResponse } from './create-tenant.response.js';

export class CreateTenantHandler {
  constructor(
    private readonly tenantRepository: TenantRepository,
    private readonly eventDispatcher: EventDispatcher,
  ) {}

  async execute(command: CreateTenantCommand): Promise<CreateTenantResponse> {
    return executeTenantUseCase(async () => {
      const name = TenantName.create(command.request.name);
      const slug = TenantSlug.create(command.request.slug);

      if (await this.tenantRepository.existsBySlug(slug)) {
        throw new TenantSlugAlreadyExistsError(slug.toString());
      }

      const tenant = Tenant.create({ name, slug });

      await this.tenantRepository.save(tenant);
      await this.eventDispatcher.dispatch(tenant.pullDomainEvents());

      return CreateTenantResponse.from(tenant);
    });
  }
}
