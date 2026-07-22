import { DomainError } from '../errors/domain-error.js';

export const ClinicalEvolutionSectionValue = {
  SubjectiveEvolution: 'SUBJECTIVE_EVOLUTION',
  ProfessionalObservations: 'PROFESSIONAL_OBSERVATIONS',
  TreatmentResponse: 'TREATMENT_RESPONSE',
  AdherenceAndBarriers: 'ADHERENCE_AND_BARRIERS',
  AdverseEventsNotes: 'ADVERSE_EVENTS_NOTES',
  NextClinicalConsiderations: 'NEXT_CLINICAL_CONSIDERATIONS',
} as const;

export type ClinicalEvolutionSectionValue =
  (typeof ClinicalEvolutionSectionValue)[keyof typeof ClinicalEvolutionSectionValue];

export class ClinicalEvolutionSection {
  private constructor(private readonly value: ClinicalEvolutionSectionValue) {}

  static parse(raw: string): ClinicalEvolutionSection {
    const normalized = raw?.trim().toUpperCase();

    if (
      !Object.values(ClinicalEvolutionSectionValue).includes(
        normalized as ClinicalEvolutionSectionValue,
      )
    ) {
      throw new DomainError(`Invalid clinical evolution section: ${raw}.`);
    }

    return new ClinicalEvolutionSection(normalized as ClinicalEvolutionSectionValue);
  }

  static fromValue(value: ClinicalEvolutionSectionValue): ClinicalEvolutionSection {
    return new ClinicalEvolutionSection(value);
  }

  toString(): ClinicalEvolutionSectionValue {
    return this.value;
  }
}
