import type { Decimal } from '@prisma/client/runtime/library';
import {
  ClinicalMeasurementDomainError,
  ClinicalMeasurementReasonCode,
} from '../errors/clinical-measurement.domain-error.js';
import {
  formatClinicalDecimal,
  isClinicalDecimalPositive,
  isClinicalDecimalZero,
  parseClinicalDecimal,
  parseOptionalClinicalDecimal,
} from './clinical-decimal-utils.js';

const CIRCUMFERENCE_SCALE = 2;

export class BodyCircumference {
  private constructor(private readonly value: Decimal) {}

  static create(raw: string, fieldName: string): BodyCircumference {
    const value = parseClinicalDecimal(raw, fieldName, CIRCUMFERENCE_SCALE);
    return BodyCircumference.fromValidatedDecimal(value, fieldName);
  }

  static createOptional(
    raw: string | null | undefined,
    fieldName: string,
  ): BodyCircumference | null {
    const value = parseOptionalClinicalDecimal(raw, fieldName, CIRCUMFERENCE_SCALE);

    if (value === null) {
      return null;
    }

    return BodyCircumference.fromValidatedDecimal(value, fieldName);
  }

  static fromDecimal(value: Decimal): BodyCircumference {
    return new BodyCircumference(value);
  }

  getValue(): Decimal {
    return this.value;
  }

  toString(): string {
    return formatClinicalDecimal(this.value, CIRCUMFERENCE_SCALE);
  }

  private static fromValidatedDecimal(
    value: Decimal,
    fieldName: string,
  ): BodyCircumference {
    if (isClinicalDecimalZero(value) || !isClinicalDecimalPositive(value)) {
      throw new ClinicalMeasurementDomainError(
        fieldName,
        ClinicalMeasurementReasonCode.MUST_BE_GREATER_THAN_ZERO,
      );
    }

    const maxCircumference = parseClinicalDecimal('500', fieldName, CIRCUMFERENCE_SCALE);

    if (value.greaterThan(maxCircumference)) {
      throw new ClinicalMeasurementDomainError(
        fieldName,
        ClinicalMeasurementReasonCode.EXCEEDS_MAXIMUM,
      );
    }

    return new BodyCircumference(value);
  }
}
