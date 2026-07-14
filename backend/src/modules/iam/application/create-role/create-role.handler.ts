import type { RoleRepository } from '../../domain/repositories/role-repository.js';
import type { TenantRepository } from '../../domain/repositories/tenant-repository.js';
import { Role } from '../../domain/aggregates/role.aggregate.js';
import { RoleName } from '../../domain/value-objects/role-name.js';
import { TenantId } from '../../domain/value-objects/tenant-id.js';
import type { EventDispatcher } from '../../../../core/application/events/event-dispatcher.js';
import { normalizeRoleNameForPersistence } from '../../infrastructure/prisma/role-name-normalizer.js';
import { executeRoleUseCase } from '../execute-role-use-case.js';
import { RoleNameAlreadyExistsError } from '../errors/role-name-already-exists.error.js';
import { TenantInactiveError } from '../errors/tenant-inactive.error.js';
import { TenantNotFoundError } from '../errors/tenant-not-found.error.js';
import { CreateRoleCommand } from './create-role.command.js';
import { toCreateRoleResponse } from './create-role.response.js';

export class CreateRoleHandler {
  constructor(
    private readonly roleRepository: RoleRepository,
    private readonly tenantRepository: TenantRepository,
    private readonly eventDispatcher: EventDispatcher,
  ) {}

  async execute(command: CreateRoleCommand) {
    return executeRoleUseCase(async () => {
      const tenantId = TenantId.create(command.request.tenantId);
      const tenant = await this.tenantRepository.findById(tenantId);

      if (!tenant) {
        throw new TenantNotFoundError(command.request.tenantId);
      }

      if (!tenant.isActive()) {
        throw new TenantInactiveError(command.request.tenantId);
      }

      const name = RoleName.create(command.request.name);
      const normalizedName = normalizeRoleNameForPersistence(name.toString());

      if (
        await this.roleRepository.existsByTenantAndNormalizedName(
          tenantId,
          normalizedName,
        )
      ) {
        throw new RoleNameAlreadyExistsError(
          command.request.tenantId,
          name.toString(),
        );
      }

      const role = Role.create({ tenantId, name });

      await this.roleRepository.save(role);
      await this.eventDispatcher.dispatch(role.pullDomainEvents());

      return toCreateRoleResponse(role);
    });
  }
}
