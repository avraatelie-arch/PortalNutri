export class CreateNutritionistCommand {
  constructor(
    readonly request: {
      personId: string;
      tenantId: string;
      crn: string;
      stateCode: string;
      specialty: string;
      bio?: string | null;
    },
  ) {}
}
