import { DomainError } from '../errors/domain-error.js';
import { ClinicalTextSection } from './clinical-text-section.js';
import { NUTRITION_DIAGNOSIS_TEXT_MAX_LENGTH } from './professional-interpretation.js';

export class CancellationReason {
  private constructor(private readonly section: ClinicalTextSection) {}

  static create(raw: string | null | undefined): CancellationReason {
    const section = ClinicalTextSection.create(raw, NUTRITION_DIAGNOSIS_TEXT_MAX_LENGTH);

    if (section.isEmpty()) {
      throw new DomainError('Cancellation reason is required.');
    }

    return new CancellationReason(section);
  }

  static fromPersistence(value: string | null | undefined): CancellationReason | null {
    if (value === null || value === undefined) {
      return null;
    }

    return new CancellationReason(
      ClinicalTextSection.fromPersistence(value, NUTRITION_DIAGNOSIS_TEXT_MAX_LENGTH),
    );
  }

  toPersistence(): string {
    const value = this.section.toPersistence();

    if (value === null) {
      throw new DomainError('Cancellation reason is required.');
    }

    return value;
  }
}
