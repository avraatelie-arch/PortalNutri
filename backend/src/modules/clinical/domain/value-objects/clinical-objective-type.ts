import { DomainError } from '../errors/domain-error.js';

export const ClinicalObjectiveTypeValue = {
  WeightLoss: 'WEIGHT_LOSS',
  WeightGain: 'WEIGHT_GAIN',
  MuscleGain: 'MUSCLE_GAIN',
  BodyFatReduction: 'BODY_FAT_REDUCTION',
  GlycemicControl: 'GLYCEMIC_CONTROL',
  LipidControl: 'LIPID_CONTROL',
  BloodPressureControl: 'BLOOD_PRESSURE_CONTROL',
  GastrointestinalSymptomControl: 'GASTROINTESTINAL_SYMPTOM_CONTROL',
  SportsPerformance: 'SPORTS_PERFORMANCE',
  PregnancySupport: 'PREGNANCY_SUPPORT',
  PostpartumRecovery: 'POSTPARTUM_RECOVERY',
  EatingBehavior: 'EATING_BEHAVIOR',
  NutritionEducation: 'NUTRITION_EDUCATION',
  ClinicalConditionSupport: 'CLINICAL_CONDITION_SUPPORT',
  Other: 'OTHER',
} as const;

export type ClinicalObjectiveTypeValue =
  (typeof ClinicalObjectiveTypeValue)[keyof typeof ClinicalObjectiveTypeValue];

export class ClinicalObjectiveType {
  private constructor(private readonly value: ClinicalObjectiveTypeValue) {}

  static parse(value: string): ClinicalObjectiveType {
    const normalized = value?.trim().toUpperCase();

    if (
      !Object.values(ClinicalObjectiveTypeValue).includes(
        normalized as ClinicalObjectiveTypeValue,
      )
    ) {
      throw new DomainError(`Invalid clinical objective type: ${value}.`);
    }

    return new ClinicalObjectiveType(normalized as ClinicalObjectiveTypeValue);
  }

  toString(): ClinicalObjectiveTypeValue {
    return this.value;
  }
}
