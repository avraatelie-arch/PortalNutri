import { ClinicalTextSection } from './clinical-text-section.js';
import { CLINICAL_OBJECTIVE_TEXT_MAX_LENGTH } from './clinical-rationale.js';

export class SuccessCriteria {
  private constructor(private readonly section: ClinicalTextSection) {}

  static empty(): SuccessCriteria {
    return new SuccessCriteria(
      ClinicalTextSection.empty(CLINICAL_OBJECTIVE_TEXT_MAX_LENGTH),
    );
  }

  static create(raw: string | null | undefined): SuccessCriteria {
    return new SuccessCriteria(
      ClinicalTextSection.create(raw, CLINICAL_OBJECTIVE_TEXT_MAX_LENGTH),
    );
  }

  static fromPersistence(value: string | null | undefined): SuccessCriteria {
    return new SuccessCriteria(
      ClinicalTextSection.fromPersistence(
        value,
        CLINICAL_OBJECTIVE_TEXT_MAX_LENGTH,
      ),
    );
  }

  equals(other: SuccessCriteria): boolean {
    return this.section.equals(other.section);
  }

  isEmpty(): boolean {
    return this.section.isEmpty();
  }

  toPersistence(): string | null {
    return this.section.toPersistence();
  }
}
