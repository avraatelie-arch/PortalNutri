export interface CreateTenantRequest {
  name: string;
  slug: string;
}

export class CreateTenantCommand {
  constructor(readonly request: CreateTenantRequest) {}
}
