import type { PermissionRepository } from '../../domain/repositories/permission-repository.js';
import type { TenantRepository } from '../../domain/repositories/tenant-repository.js';
import { Permission } from '../../domain/aggregates/permission.aggregate.js';
import { PermissionName } from '../../domain/value-objects/permission-name.js';
import { TenantId } from '../../domain/value-objects/tenant-id.js';
import type { EventDispatcher } from '../../../../core/application/events/event-dispatcher.js';
import { executePermissionUseCase } from '../execute-permission-use-case.js';
import { PermissionNameAlreadyExistsError } from '../errors/permission-name-already-exists.error.js';
import { TenantInactiveError } from '../errors/tenant-inactive.error.js';
import { TenantNotFoundError } from '../errors/tenant-not-found.error.js';
import { CreatePermissionCommand } from './create-permission.command.js';
import { toCreatePermissionResponse } from './create-permission.response.js';

export class CreatePermissionHandler {
  constructor(
    private readonly permissionRepository: PermissionRepository,
    private readonly tenantRepository: TenantRepository,
    private readonly eventDispatcher: EventDispatcher,
  ) {}

  async execute(command: CreatePermissionCommand) {
    return executePermissionUseCase(async () => {
      const tenantId = TenantId.create(command.request.tenantId);
      const tenant = await this.tenantRepository.findById(tenantId);

      if (!tenant) {
        throw new TenantNotFoundError(command.request.tenantId);
      }

      if (!tenant.isActive()) {
        throw new TenantInactiveError(command.request.tenantId);
      }

      const name = PermissionName.create(command.request.name);

      if (
        await this.permissionRepository.existsByTenantAndNormalizedName(
          tenantId,
          name.normalizedValue,
        )
      ) {
        throw new PermissionNameAlreadyExistsError(
          command.request.tenantId,
          name.toString(),
        );
      }

      const permission = Permission.create({ tenantId, name });

      await this.permissionRepository.save(permission);
      await this.eventDispatcher.dispatch(permission.pullDomainEvents());

      return toCreatePermissionResponse(permission);
    });
  }
}
