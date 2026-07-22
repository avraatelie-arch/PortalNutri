import { ClinicalTextSection } from './clinical-text-section.js';
import { PRESCRIPTION_TEXT_MAX_LENGTH } from './prescription-text.js';

function createOptionalTextSectionClass() {
  class OptionalTextSection {
    protected constructor(protected readonly section: ClinicalTextSection) {}

    static empty(): OptionalTextSection {
      return new this(ClinicalTextSection.empty(PRESCRIPTION_TEXT_MAX_LENGTH));
    }

    static create(raw: string | null | undefined): OptionalTextSection {
      return new this(
        ClinicalTextSection.create(raw, PRESCRIPTION_TEXT_MAX_LENGTH),
      );
    }

    static fromPersistence(value: string | null | undefined): OptionalTextSection {
      return new this(
        ClinicalTextSection.fromPersistence(value, PRESCRIPTION_TEXT_MAX_LENGTH),
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

export class DosageForm extends createOptionalTextSectionClass() {}
export class AdministrationRoute extends createOptionalTextSectionClass() {}
export class ActiveIngredients extends createOptionalTextSectionClass() {}
export class Concentration extends createOptionalTextSectionClass() {}
export class Duration extends createOptionalTextSectionClass() {}
export class AdministrationInstructions extends createOptionalTextSectionClass() {}
export class LineClinicalNotes extends createOptionalTextSectionClass() {}
export class PatientInstructions extends createOptionalTextSectionClass() {}

export class PrescriptionClinicalNotes {
  private constructor(private readonly section: ClinicalTextSection) {}

  static empty(): PrescriptionClinicalNotes {
    return new PrescriptionClinicalNotes(
      ClinicalTextSection.empty(PRESCRIPTION_TEXT_MAX_LENGTH),
    );
  }

  static create(raw: string | null | undefined): PrescriptionClinicalNotes {
    return new PrescriptionClinicalNotes(
      ClinicalTextSection.create(raw, PRESCRIPTION_TEXT_MAX_LENGTH),
    );
  }

  static fromPersistence(value: string | null | undefined): PrescriptionClinicalNotes {
    return new PrescriptionClinicalNotes(
      ClinicalTextSection.fromPersistence(value, PRESCRIPTION_TEXT_MAX_LENGTH),
    );
  }

  equals(other: PrescriptionClinicalNotes): boolean {
    return this.section.equals(other.section);
  }

  isEmpty(): boolean {
    return this.section.isEmpty();
  }

  toPersistence(): string | null {
    return this.section.toPersistence();
  }
}
