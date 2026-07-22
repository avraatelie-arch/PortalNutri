import { DomainError } from '../errors/domain-error.js';
import { ClinicalTextSection } from './clinical-text-section.js';
import { PRESCRIPTION_TEXT_MAX_LENGTH } from './prescription-text.js';

export class PrescriptionCancellationReason {
  private constructor(private readonly section: ClinicalTextSection) {}

  static create(raw: string | null | undefined): PrescriptionCancellationReason {
    const section = ClinicalTextSection.create(raw, PRESCRIPTION_TEXT_MAX_LENGTH);

    if (section.isEmpty()) {
      throw new DomainError('Cancellation reason is required.');
    }

    return new PrescriptionCancellationReason(section);
  }

  static fromPersistence(
    value: string | null | undefined,
  ): PrescriptionCancellationReason | null {
    if (value === null || value === undefined) {
      return null;
    }

    return new PrescriptionCancellationReason(
      ClinicalTextSection.fromPersistence(value, PRESCRIPTION_TEXT_MAX_LENGTH),
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
