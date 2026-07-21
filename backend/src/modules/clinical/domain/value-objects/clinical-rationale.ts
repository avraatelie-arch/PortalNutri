import { ClinicalTextSection } from './clinical-text-section.js';

export const CLINICAL_OBJECTIVE_TEXT_MAX_LENGTH = 4000;

export class ClinicalRationale {
  private constructor(private readonly section: ClinicalTextSection) {}

  static empty(): ClinicalRationale {
    return new ClinicalRationale(
      ClinicalTextSection.empty(CLINICAL_OBJECTIVE_TEXT_MAX_LENGTH),
    );
  }

  static create(raw: string | null | undefined): ClinicalRationale {
    return new ClinicalRationale(
      ClinicalTextSection.create(raw, CLINICAL_OBJECTIVE_TEXT_MAX_LENGTH),
    );
  }

  static fromPersistence(value: string | null | undefined): ClinicalRationale {
    return new ClinicalRationale(
      ClinicalTextSection.fromPersistence(
        value,
        CLINICAL_OBJECTIVE_TEXT_MAX_LENGTH,
      ),
    );
  }

  equals(other: ClinicalRationale): boolean {
    return this.section.equals(other.section);
  }

  isEmpty(): boolean {
    return this.section.isEmpty();
  }

  toPersistence(): string | null {
    return this.section.toPersistence();
  }
}
