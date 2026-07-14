export class RemoveRoleCommand {
  constructor(
    readonly request: {
      membershipId: string;
      roleId: string;
    },
  ) {}
}
