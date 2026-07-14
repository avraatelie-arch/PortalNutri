import type { RoleRepository } from '../../domain/repositories/role-repository.js';
import { RoleId } from '../../domain/value-objects/role-id.js';
import { executeRoleUseCase } from '../execute-role-use-case.js';
import { RoleNotFoundError } from '../errors/role-not-found.error.js';
import { FindRoleQuery } from './find-role.query.js';
import { toFindRoleResult, type FindRoleResult } from './find-role.result.js';

export class FindRoleHandler {
  constructor(private readonly roleRepository: RoleRepository) {}

  async execute(query: FindRoleQuery): Promise<FindRoleResult> {
    return executeRoleUseCase(async () => {
      const role = await this.roleRepository.findById(
        RoleId.create(query.roleId),
      );

      if (!role) {
        throw new RoleNotFoundError(query.roleId);
      }

      return toFindRoleResult(role);
    });
  }
}
