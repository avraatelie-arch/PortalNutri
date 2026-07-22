import { DomainError } from '../errors/domain-error.js';
import { normalizePrescriptionLineDescription } from './normalize-prescription-line-description.js';

export const PRESCRIPTION_LINE_DESCRIPTION_MAX_LENGTH = 500;

export class PrescriptionLineDescription {
  private constructor(private readonly value: string) {}

  static create(value: string | null | undefined): PrescriptionLineDescription {
    if (value === null || value === undefined) {
      return new PrescriptionLineDescription('');
    }

    const normalized = value.trim().replace(/\s+/g, ' ');

    if (normalized.length > PRESCRIPTION_LINE_DESCRIPTION_MAX_LENGTH) {
      throw new DomainError(
        `Prescription line description must not exceed ${PRESCRIPTION_LINE_DESCRIPTION_MAX_LENGTH} characters.`,
      );
    }

    return new PrescriptionLineDescription(normalized);
  }

  static fromPersistence(value: string): PrescriptionLineDescription {
    return new PrescriptionLineDescription(value ?? '');
  }

  equals(other: PrescriptionLineDescription): boolean {
    return this.value === other.value;
  }

  isEmpty(): boolean {
    return this.value.length === 0;
  }

  getNormalizedKey(): string {
    return normalizePrescriptionLineDescription(this.value);
  }

  toPersistence(): string {
    return this.value;
  }
}
