import { AddPersonToTenantCommand } from '../../application/add-person-to-tenant/add-person-to-tenant.command.js';
import type { AddPersonToTenantResponse } from '../../application/add-person-to-tenant/add-person-to-tenant.response.js';
import type { FindMembershipResult } from '../../application/find-membership/find-membership.result.js';
import type { RemovePersonFromTenantResult } from '../../application/remove-person-from-tenant/remove-person-from-tenant.result.js';
import { RemovePersonFromTenantCommand } from '../../application/remove-person-from-tenant/remove-person-from-tenant.command.js';
import type { CreateMembershipBody } from './schemas/membership.schemas.js';

export function toAddPersonToTenantCommand(
  body: CreateMembershipBody,
): AddPersonToTenantCommand {
  return new AddPersonToTenantCommand({
    personId: body.personId,
    tenantId: body.tenantId,
  });
}

export function toRemovePersonFromTenantCommand(params: {
  personId: string;
  tenantId: string;
}): RemovePersonFromTenantCommand {
  return new RemovePersonFromTenantCommand({
    personId: params.personId,
    tenantId: params.tenantId,
  });
}

export function toMembershipHttpResponse(
  result:
    | AddPersonToTenantResponse
    | FindMembershipResult
    | RemovePersonFromTenantResult,
) {
  return {
    id: result.id,
    personId: result.personId,
    tenantId: result.tenantId,
    status: result.status,
    createdAt: result.createdAt,
    reactivatedAt: result.reactivatedAt,
    removedAt: result.removedAt,
  };
}
