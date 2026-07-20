import type { Decimal } from '@prisma/client/runtime/library';
import { AnthropometricMeasurementDomainError } from '../errors/anthropometric-measurement.domain-error.js';
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
      throw new AnthropometricMeasurementDomainError(fieldName, 'must be greater than zero');
    }

    const maxCircumference = parseClinicalDecimal('500', fieldName, CIRCUMFERENCE_SCALE);

    if (value.greaterThan(maxCircumference)) {
      throw new AnthropometricMeasurementDomainError(fieldName, 'exceeds maximum allowed value');
    }

    return new BodyCircumference(value);
  }
}
