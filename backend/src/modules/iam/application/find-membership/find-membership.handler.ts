import type { MembershipRepository } from '../../domain/repositories/membership-repository.js';
import { MembershipId } from '../../domain/value-objects/membership-id.js';
import { executeMembershipUseCase } from '../execute-membership-use-case.js';
import { MembershipNotFoundError } from '../errors/membership-not-found.error.js';
import { FindMembershipQuery } from './find-membership.query.js';
import {
  toFindMembershipResult,
  type FindMembershipResult,
} from './find-membership.result.js';

export class FindMembershipHandler {
  constructor(private readonly membershipRepository: MembershipRepository) {}

  async execute(query: FindMembershipQuery): Promise<FindMembershipResult> {
    return executeMembershipUseCase(async () => {
      const membership = await this.membershipRepository.findById(
        MembershipId.create(query.membershipId),
      );

      if (!membership) {
        throw new MembershipNotFoundError(query.membershipId);
      }

      return toFindMembershipResult(membership);
    });
  }
}
