import { ClinicalTextSection } from './clinical-text-section.js';

export const OUTCOME_TRACKING_TEXT_MAX_LENGTH = 4000;

function createOptionalTextSectionClass() {
  class OptionalTextSection {
    protected constructor(protected readonly section: ClinicalTextSection) {}

    static empty(): OptionalTextSection {
      return new this(ClinicalTextSection.empty(OUTCOME_TRACKING_TEXT_MAX_LENGTH));
    }

    static create(raw: string | null | undefined): OptionalTextSection {
      return new this(
        ClinicalTextSection.create(raw, OUTCOME_TRACKING_TEXT_MAX_LENGTH),
      );
    }

    static fromPersistence(
      value: string | null | undefined,
    ): OptionalTextSection {
      return new this(
        ClinicalTextSection.fromPersistence(
          value,
          OUTCOME_TRACKING_TEXT_MAX_LENGTH,
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

export class ProfessionalRationale extends createOptionalTextSectionClass() {}
export class OutcomeClinicalNotes extends createOptionalTextSectionClass() {}
