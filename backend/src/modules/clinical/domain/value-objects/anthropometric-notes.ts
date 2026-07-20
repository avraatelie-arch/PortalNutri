import { AnthropometricMeasurementDomainError } from '../errors/anthropometric-measurement.domain-error.js';
import { normalizeClinicalSectionText } from './normalize-clinical-section-text.js';

export const ANTHROPOMETRIC_NOTES_MAX_LENGTH = 5000;

export class AnthropometricNotes {
  private constructor(private readonly value: string | null) {}

  static create(raw: string | null | undefined): AnthropometricNotes {
    if (raw === null || raw === undefined) {
      return new AnthropometricNotes(null);
    }

    const normalized = normalizeClinicalSectionText(raw);

    if (normalized === null) {
      return new AnthropometricNotes(null);
    }

    if (normalized.length > ANTHROPOMETRIC_NOTES_MAX_LENGTH) {
      throw new AnthropometricMeasurementDomainError(
        'notes',
        `exceeds maximum length of ${ANTHROPOMETRIC_NOTES_MAX_LENGTH} characters`,
      );
    }

    return new AnthropometricNotes(normalized);
  }

  static fromPersistence(value: string | null): AnthropometricNotes {
    return new AnthropometricNotes(value);
  }

  toPersistence(): string | null {
    return this.value;
  }

  toString(): string | null {
    return this.value;
  }
}
