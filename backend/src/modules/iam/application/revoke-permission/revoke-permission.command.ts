export class RevokePermissionCommand {
  constructor(
    readonly request: {
      roleId: string;
      permissionId: string;
    },
  ) {}
}
