import { ClinicalTextSection } from './clinical-text-section.js';
import { CLINICAL_EVOLUTION_TEXT_MAX_LENGTH } from './clinical-evolution-text.js';

function createOptionalTextSectionClass() {
  class OptionalTextSection {
    protected constructor(protected readonly section: ClinicalTextSection) {}

    static empty(): OptionalTextSection {
      return new this(ClinicalTextSection.empty(CLINICAL_EVOLUTION_TEXT_MAX_LENGTH));
    }

    static create(raw: string | null | undefined): OptionalTextSection {
      return new this(
        ClinicalTextSection.create(raw, CLINICAL_EVOLUTION_TEXT_MAX_LENGTH),
      );
    }

    static fromPersistence(
      value: string | null | undefined,
    ): OptionalTextSection {
      return new this(
        ClinicalTextSection.fromPersistence(
          value,
          CLINICAL_EVOLUTION_TEXT_MAX_LENGTH,
        ),
      );
    }

    equals(other: OptionalTextSection): boolean {
      return this.section.equals(other.section);
    }

    isEmpty(): boolean {
      return this.section.isEmpty();
    }

    toPersistence(): string | null {
      return this.section.toPersistence();
    }
  }

  return OptionalTextSection;
}

export class SubjectiveEvolution extends createOptionalTextSectionClass() {}
export class ProfessionalObservations extends createOptionalTextSectionClass() {}
export class TreatmentResponse extends createOptionalTextSectionClass() {}
export class AdherenceAndBarriers extends createOptionalTextSectionClass() {}
export class AdverseEventsNotes extends createOptionalTextSectionClass() {}
export class NextClinicalConsiderations extends createOptionalTextSectionClass() {}
