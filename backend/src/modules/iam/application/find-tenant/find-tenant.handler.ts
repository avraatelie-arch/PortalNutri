import type { TenantRepository } from '../../domain/repositories/tenant-repository.js';
import { TenantId } from '../../domain/value-objects/tenant-id.js';
import { executeTenantUseCase } from '../execute-tenant-use-case.js';
import { TenantNotFoundError } from '../errors/tenant-not-found.error.js';
import { FindTenantQuery } from './find-tenant.query.js';
import {
  toFindTenantResult,
  type FindTenantResult,
} from './find-tenant.result.js';

export class FindTenantHandler {
  constructor(private readonly tenantRepository: TenantRepository) {}

  async execute(query: FindTenantQuery): Promise<FindTenantResult> {
    return executeTenantUseCase(async () => {
      const tenant = await this.tenantRepository.findById(
        TenantId.create(query.tenantId),
      );

      if (!tenant) {
        throw new TenantNotFoundError(query.tenantId);
      }

      return toFindTenantResult(tenant);
    });
  }
}
