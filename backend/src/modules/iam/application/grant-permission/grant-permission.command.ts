export class GrantPermissionCommand {
  constructor(
    readonly request: {
      roleId: string;
      permissionId: string;
    },
  ) {}
}
