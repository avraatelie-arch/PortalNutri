import { ClinicalMeasurementReasonCode } from '../errors/clinical-measurement.domain-error.js';
import { BodyCompositionMeasurementDomainError } from '../errors/body-composition-measurement.domain-error.js';

const FIELD_NAME = 'metabolicAge';
const MAX_METABOLIC_AGE = 150;

function parseClinicalInteger(raw: string, fieldName: string): number {
  const trimmed = raw.trim();

  if (trimmed.length === 0) {
    throw new BodyCompositionMeasurementDomainError(
      fieldName,
      ClinicalMeasurementReasonCode.REQUIRED,
    );
  }

  if (!/^\d+$/.test(trimmed)) {
    throw new BodyCompositionMeasurementDomainError(
      fieldName,
      ClinicalMeasurementReasonCode.INVALID_DECIMAL_FORMAT,
    );
  }

  const value = Number(trimmed);

  if (!Number.isSafeInteger(value)) {
    throw new BodyCompositionMeasurementDomainError(
      fieldName,
      ClinicalMeasurementReasonCode.NOT_FINITE,
    );
  }

  return value;
}

function validateNonNegativeInteger(value: number, fieldName: string, maxValue: number): void {
  if (value < 0) {
    throw new BodyCompositionMeasurementDomainError(
      fieldName,
      ClinicalMeasurementReasonCode.BELOW_MINIMUM,
    );
  }

  if (value > maxValue) {
    throw new BodyCompositionMeasurementDomainError(
      fieldName,
      ClinicalMeasurementReasonCode.EXCEEDS_MAXIMUM,
    );
  }
}

export class MetabolicAge {
  private constructor(private readonly value: number) {}

  static create(raw: string): MetabolicAge {
    const value = parseClinicalInteger(raw, FIELD_NAME);
    validateNonNegativeInteger(value, FIELD_NAME, MAX_METABOLIC_AGE);
    return new MetabolicAge(value);
  }

  static createOptional(raw: string | null | undefined): MetabolicAge | null {
    if (raw === null || raw === undefined) {
      return null;
    }

    const trimmed = raw.trim();

    if (trimmed.length === 0) {
      return null;
    }

    const value = parseClinicalInteger(trimmed, FIELD_NAME);
    validateNonNegativeInteger(value, FIELD_NAME, MAX_METABOLIC_AGE);
    return new MetabolicAge(value);
  }

  static fromPersistence(value: number): MetabolicAge {
    return new MetabolicAge(value);
  }

  getValue(): number {
    return this.value;
  }

  toString(): string {
    return String(this.value);
  }
}
