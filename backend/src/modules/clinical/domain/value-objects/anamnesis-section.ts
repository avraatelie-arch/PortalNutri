import { DomainError } from '../errors/domain-error.js';

export const AnamnesisSectionValue = {
  ChiefComplaint: 'CHIEF_COMPLAINT',
  CurrentHistory: 'CURRENT_HISTORY',
  MedicalHistory: 'MEDICAL_HISTORY',
  FamilyHistory: 'FAMILY_HISTORY',
  GastrointestinalHistory: 'GASTROINTESTINAL_HISTORY',
  DietaryHistory: 'DIETARY_HISTORY',
  LifestyleHistory: 'LIFESTYLE_HISTORY',
  MedicationHistory: 'MEDICATION_HISTORY',
  SupplementHistory: 'SUPPLEMENT_HISTORY',
  AllergiesAndIntolerances: 'ALLERGIES_AND_INTOLERANCES',
  Observations: 'OBSERVATIONS',
} as const;

export type AnamnesisSectionValue =
  (typeof AnamnesisSectionValue)[keyof typeof AnamnesisSectionValue];

export class AnamnesisSection {
  private constructor(private readonly value: AnamnesisSectionValue) {}

  static parse(raw: string): AnamnesisSection {
    const normalized = raw?.trim().toUpperCase();

    if (
      !Object.values(AnamnesisSectionValue).includes(
        normalized as AnamnesisSectionValue,
      )
    ) {
      throw new DomainError(`Invalid anamnesis section: ${raw}.`);
    }

    return new AnamnesisSection(normalized as AnamnesisSectionValue);
  }

  static fromValue(value: AnamnesisSectionValue): AnamnesisSection {
    return new AnamnesisSection(value);
  }

  toString(): AnamnesisSectionValue {
    return this.value;
  }
}

export const CHIEF_COMPLAINT_MAX_LENGTH = 2000;
export const ANAMNESIS_SECTION_MAX_LENGTH = 10000;

export function maxLengthForSection(section: AnamnesisSection): number {
  if (section.toString() === AnamnesisSectionValue.ChiefComplaint) {
    return CHIEF_COMPLAINT_MAX_LENGTH;
  }

  return ANAMNESIS_SECTION_MAX_LENGTH;
}
