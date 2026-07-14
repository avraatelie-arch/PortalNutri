export class AssignRoleCommand {
  constructor(
    readonly request: {
      membershipId: string;
      roleId: string;
    },
  ) {}
}
