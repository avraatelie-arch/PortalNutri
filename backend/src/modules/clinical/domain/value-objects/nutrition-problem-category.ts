import { DomainError } from '../errors/domain-error.js';

export const NutritionProblemCategoryValue = {
  EnergyBalance: 'ENERGY_BALANCE',
  MacronutrientInadequacy: 'MACRONUTRIENT_INADEQUACY',
  MicronutrientDeficiency: 'MICRONUTRIENT_DEFICIENCY',
  GlycemicDysregulation: 'GLYCEMIC_DYSREGULATION',
  Dysphagia: 'DYSPHAGIA',
  SarcopeniaRisk: 'SARCOPENIA_RISK',
  DisorderedEatingPattern: 'DISORDERED_EATING_PATTERN',
  Gastrointestinal: 'GASTROINTESTINAL',
  RenalNutrition: 'RENAL_NUTRITION',
  ClinicalConditionSupport: 'CLINICAL_CONDITION_SUPPORT',
  Other: 'OTHER',
} as const;

export type NutritionProblemCategoryValue =
  (typeof NutritionProblemCategoryValue)[keyof typeof NutritionProblemCategoryValue];

export class NutritionProblemCategory {
  private constructor(private readonly value: NutritionProblemCategoryValue) {}

  static parse(value: string): NutritionProblemCategory {
    const normalized = value?.trim().toUpperCase();

    if (
      !Object.values(NutritionProblemCategoryValue).includes(
        normalized as NutritionProblemCategoryValue,
      )
    ) {
      throw new DomainError(`Invalid nutrition problem category: ${value}.`);
    }

    return new NutritionProblemCategory(normalized as NutritionProblemCategoryValue);
  }

  toString(): NutritionProblemCategoryValue {
    return this.value;
  }
}
