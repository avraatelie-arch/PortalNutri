import type { Decimal } from '@prisma/client/runtime/library';
import { AnthropometricMeasurementDomainError } from '../errors/anthropometric-measurement.domain-error.js';
import {
  formatClinicalDecimal,
  isClinicalDecimalPositive,
  isClinicalDecimalZero,
  parseClinicalDecimal,
} from './clinical-decimal-utils.js';

const WEIGHT_SCALE = 2;

export class BodyWeight {
  private constructor(private readonly value: Decimal) {}

  static create(raw: string): BodyWeight {
    const value = parseClinicalDecimal(raw, 'weightKg', WEIGHT_SCALE);

    if (isClinicalDecimalZero(value) || !isClinicalDecimalPositive(value)) {
      throw new AnthropometricMeasurementDomainError('weightKg', 'must be greater than zero');
    }

    const maxWeight = parseClinicalDecimal('500', 'weightKg', WEIGHT_SCALE);

    if (value.greaterThan(maxWeight)) {
      throw new AnthropometricMeasurementDomainError('weightKg', 'exceeds maximum allowed value');
    }

    return new BodyWeight(value);
  }

  static fromDecimal(value: Decimal): BodyWeight {
    return new BodyWeight(value);
  }

  getValue(): Decimal {
    return this.value;
  }

  toString(): string {
    return formatClinicalDecimal(this.value, WEIGHT_SCALE);
  }
}
