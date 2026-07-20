import { ClinicalMeasurementReasonCode } from '../errors/clinical-measurement.domain-error.js';
import { BodyCompositionMeasurementDomainError } from '../errors/body-composition-measurement.domain-error.js';

const FIELD_NAME = 'basalMetabolicRate';
const MAX_BMR = 10_000;

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

export class BasalMetabolicRate {
  private constructor(private readonly value: number) {}

  static create(raw: string): BasalMetabolicRate {
    const value = parseClinicalInteger(raw, FIELD_NAME);
    validateNonNegativeInteger(value, FIELD_NAME, MAX_BMR);
    return new BasalMetabolicRate(value);
  }

  static createOptional(raw: string | null | undefined): BasalMetabolicRate | null {
    if (raw === null || raw === undefined) {
      return null;
    }

    const trimmed = raw.trim();

    if (trimmed.length === 0) {
      return null;
    }

    const value = parseClinicalInteger(trimmed, FIELD_NAME);
    validateNonNegativeInteger(value, FIELD_NAME, MAX_BMR);
    return new BasalMetabolicRate(value);
  }

  static fromPersistence(value: number): BasalMetabolicRate {
    return new BasalMetabolicRate(value);
  }

  getValue(): number {
    return this.value;
  }

  toString(): string {
    return String(this.value);
  }
}
