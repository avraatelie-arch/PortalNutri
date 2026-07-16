export interface UpdateNutritionistProfileRequest {
  nutritionistId: string;
  specialty?: string;
  bio?: string | null;
}

export class UpdateNutritionistProfileCommand {
  constructor(readonly request: UpdateNutritionistProfileRequest) {}
}
