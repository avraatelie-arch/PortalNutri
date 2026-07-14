import type { RoleAssignmentRepository } from '../../domain/repositories/role-assignment-repository.js';
import { RoleAssignmentId } from '../../domain/value-objects/role-assignment-id.js';
import { executeRoleAssignmentUseCase } from '../execute-role-assignment-use-case.js';
import { RoleAssignmentNotFoundError } from '../errors/role-assignment-not-found.error.js';
import { FindRoleAssignmentQuery } from './find-role-assignment.query.js';
import {
  toFindRoleAssignmentResult,
  type FindRoleAssignmentResult,
} from './find-role-assignment.result.js';

export class FindRoleAssignmentHandler {
  constructor(
    private readonly roleAssignmentRepository: RoleAssignmentRepository,
  ) {}

  async execute(
    query: FindRoleAssignmentQuery,
  ): Promise<FindRoleAssignmentResult> {
    return executeRoleAssignmentUseCase(async () => {
      const assignment = await this.roleAssignmentRepository.findById(
        RoleAssignmentId.create(query.roleAssignmentId),
      );

      if (!assignment) {
        throw new RoleAssignmentNotFoundError(
          undefined,
          undefined,
          query.roleAssignmentId,
        );
      }

      return toFindRoleAssignmentResult(assignment);
    });
  }
}
