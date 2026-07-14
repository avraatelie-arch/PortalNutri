import type { PermissionAssignmentRepository } from '../../domain/repositories/permission-assignment-repository.js';
import { PermissionAssignmentId } from '../../domain/value-objects/permission-assignment-id.js';
import { executePermissionAssignmentUseCase } from '../execute-permission-assignment-use-case.js';
import { PermissionAssignmentNotFoundError } from '../errors/permission-assignment-not-found.error.js';
import { FindPermissionAssignmentQuery } from './find-permission-assignment.query.js';
import {
  toFindPermissionAssignmentResult,
  type FindPermissionAssignmentResult,
} from './find-permission-assignment.result.js';

export class FindPermissionAssignmentHandler {
  constructor(
    private readonly permissionAssignmentRepository: PermissionAssignmentRepository,
  ) {}

  async execute(
    query: FindPermissionAssignmentQuery,
  ): Promise<FindPermissionAssignmentResult> {
    return executePermissionAssignmentUseCase(async () => {
      const assignment = await this.permissionAssignmentRepository.findById(
        PermissionAssignmentId.create(query.permissionAssignmentId),
      );

      if (!assignment) {
        throw new PermissionAssignmentNotFoundError(
          undefined,
          undefined,
          query.permissionAssignmentId,
        );
      }

      return toFindPermissionAssignmentResult(assignment);
    });
  }
}
