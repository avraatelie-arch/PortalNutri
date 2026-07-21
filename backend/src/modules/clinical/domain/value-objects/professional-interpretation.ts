import { ClinicalTextSection } from './clinical-text-section.js';

export const NUTRITION_DIAGNOSIS_TEXT_MAX_LENGTH = 4000;

export class ProfessionalInterpretation {
  private constructor(private readonly section: ClinicalTextSection) {}

  static empty(): ProfessionalInterpretation {
    return new ProfessionalInterpretation(
      ClinicalTextSection.empty(NUTRITION_DIAGNOSIS_TEXT_MAX_LENGTH),
    );
  }

  static create(raw: string | null | undefined): ProfessionalInterpretation {
    return new ProfessionalInterpretation(
      ClinicalTextSection.create(raw, NUTRITION_DIAGNOSIS_TEXT_MAX_LENGTH),
    );
  }

  static fromPersistence(
    value: string | null | undefined,
  ): ProfessionalInterpretation {
    return new ProfessionalInterpretation(
      ClinicalTextSection.fromPersistence(
        value,
        NUTRITION_DIAGNOSIS_TEXT_MAX_LENGTH,
      ),
    );
  }

  equals(other: ProfessionalInterpretation): boolean {
    return this.section.equals(other.section);
  }

  isEmpty(): boolean {
    return this.section.isEmpty();
  }

  toPersistence(): string | null {
    return this.section.toPersistence();
  }
}
