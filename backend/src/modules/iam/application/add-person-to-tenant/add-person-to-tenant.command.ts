export class AddPersonToTenantCommand {
  constructor(
    readonly request: {
      personId: string;
      tenantId: string;
    },
  ) {}
}
