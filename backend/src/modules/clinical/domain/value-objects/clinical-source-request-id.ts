import { AnthropometricMeasurementDomainError } from '../errors/anthropometric-measurement.domain-error.js';

const SOURCE_REQUEST_ID_MAX_LENGTH = 100;
const SOURCE_REQUEST_ID_PATTERN = /^[A-Za-z0-9_:-]+$/;

export class ClinicalSourceRequestId {
  private constructor(private readonly value: string) {}

  static createOptional(raw: string | null | undefined): ClinicalSourceRequestId | null {
    if (raw === null || raw === undefined) {
      return null;
    }

    const trimmed = raw.trim();

    if (trimmed.length === 0) {
      return null;
    }

    if (trimmed.length > SOURCE_REQUEST_ID_MAX_LENGTH) {
      throw new AnthropometricMeasurementDomainError(
        'sourceRequestId',
        `exceeds maximum length of ${SOURCE_REQUEST_ID_MAX_LENGTH} characters`,
      );
    }

    if (!SOURCE_REQUEST_ID_PATTERN.test(trimmed)) {
      throw new AnthropometricMeasurementDomainError(
        'sourceRequestId',
        'contains invalid characters',
      );
    }

    return new ClinicalSourceRequestId(trimmed);
  }

  static fromPersistence(value: string): ClinicalSourceRequestId {
    return new ClinicalSourceRequestId(value);
  }

  toString(): string {
    return this.value;
  }
}
