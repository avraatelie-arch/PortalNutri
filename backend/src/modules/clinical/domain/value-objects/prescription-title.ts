import { DomainError } from '../errors/domain-error.js';
import { PrescriptionTitleRequiredDomainError } from '../errors/prescription-title-required.domain-error.js';

export const PRESCRIPTION_TITLE_MAX_LENGTH = 200;

export class PrescriptionTitle {
  private constructor(private readonly value: string) {}

  static create(value: string | null | undefined): PrescriptionTitle {
    if (value === null || value === undefined) {
      return new PrescriptionTitle('');
    }

    const normalized = value.trim().replace(/\s+/g, ' ');

    if (normalized.length > PRESCRIPTION_TITLE_MAX_LENGTH) {
      throw new DomainError(
        `Prescription title must not exceed ${PRESCRIPTION_TITLE_MAX_LENGTH} characters.`,
      );
    }

    return new PrescriptionTitle(normalized);
  }

  static createForEmit(value: string): PrescriptionTitle {
    const title = PrescriptionTitle.create(value);

    if (title.isEmpty()) {
      throw new PrescriptionTitleRequiredDomainError();
    }

    return title;
  }

  static fromPersistence(value: string): PrescriptionTitle {
    return new PrescriptionTitle(value ?? '');
  }

  equals(other: PrescriptionTitle): boolean {
    return this.value === other.value;
  }

  isEmpty(): boolean {
    return this.value.length === 0;
  }

  toPersistence(): string {
    return this.value;
  }
}
