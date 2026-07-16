export class CreatePatientCommand {
  constructor(
    readonly request: {
      tenantId: string;
      fullName: string;
      birthDate: string;
      gender: string;
      phone?: string | null;
      email?: string | null;
    },
  ) {}
}
