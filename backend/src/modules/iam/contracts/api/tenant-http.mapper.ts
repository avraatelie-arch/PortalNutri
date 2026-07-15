import { CreateTenantCommand } from '../../application/create-tenant/create-tenant.command.js';
import type { CreateTenantBody } from './schemas/tenant.schemas.js';

export function toCreateTenantCommand(body: CreateTenantBody): CreateTenantCommand {
  return new CreateTenantCommand({
    name: body.name,
    slug: body.slug,
  });
}
