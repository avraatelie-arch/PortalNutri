export class CreatePermissionCommand {
  constructor(
    readonly request: {
      tenantId: string;
      name: string;
    },
  ) {}
}
