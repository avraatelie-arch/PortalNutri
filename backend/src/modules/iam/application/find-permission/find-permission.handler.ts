import type { PermissionRepository } from '../../domain/repositories/permission-repository.js';
import { PermissionId } from '../../domain/value-objects/permission-id.js';
import { executePermissionUseCase } from '../execute-permission-use-case.js';
import { PermissionNotFoundError } from '../errors/permission-not-found.error.js';
import { FindPermissionQuery } from './find-permission.query.js';
import {
  toFindPermissionResult,
  type FindPermissionResult,
} from './find-permission.result.js';

export class FindPermissionHandler {
  constructor(private readonly permissionRepository: PermissionRepository) {}

  async execute(query: FindPermissionQuery): Promise<FindPermissionResult> {
    return executePermissionUseCase(async () => {
      const permission = await this.permissionRepository.findById(
        PermissionId.create(query.permissionId),
      );

      if (!permission) {
        throw new PermissionNotFoundError(query.permissionId);
      }

      return toFindPermissionResult(permission);
    });
  }
}
