export class CreateRoleCommand {
  constructor(
    readonly request: {
      tenantId: string;
      name: string;
    },
  ) {}
}
