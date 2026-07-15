export class SelectTenantCommand {
  constructor(
    readonly request: {
      sessionId: string;
      personId: string;
      tenantId: string;
    },
  ) {}
}
