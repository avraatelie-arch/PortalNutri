export class RemovePersonFromTenantCommand {
  constructor(
    readonly request: {
      personId: string;
      tenantId: string;
    },
  ) {}
}
