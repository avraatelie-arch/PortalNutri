import { Decimal } from '@prisma/client/runtime/library';
import { AnthropometricMeasurementDomainError } from '../errors/anthropometric-measurement.domain-error.js';

export function parseClinicalDecimal(
  raw: string,
  fieldName: string,
  maxScale: number,
): Decimal {
  const trimmed = raw.trim();

  if (trimmed.length === 0) {
    throw new AnthropometricMeasurementDomainError(fieldName, 'value is required');
  }

  if (!/^-?\d+(\.\d+)?$/.test(trimmed)) {
    throw new AnthropometricMeasurementDomainError(fieldName, 'invalid decimal format');
  }

  let decimal: Decimal;

  try {
    decimal = new Decimal(trimmed);
  }
  catch {
    throw new AnthropometricMeasurementDomainError(fieldName, 'invalid decimal format');
  }

  if (!decimal.isFinite()) {
    throw new AnthropometricMeasurementDomainError(fieldName, 'must be a finite number');
  }

  assertScale(decimal, fieldName, maxScale);

  return decimal;
}

export function parseOptionalClinicalDecimal(
  raw: string | null | undefined,
  fieldName: string,
  maxScale: number,
): Decimal | null {
  if (raw === null || raw === undefined) {
    return null;
  }

  const trimmed = raw.trim();

  if (trimmed.length === 0) {
    return null;
  }

  return parseClinicalDecimal(trimmed, fieldName, maxScale);
}

export function formatClinicalDecimal(value: Decimal, scale: number): string {
  return value.toFixed(scale);
}

export function roundHalfUp(value: Decimal, scale: number): Decimal {
  return value.toDecimalPlaces(scale, Decimal.ROUND_HALF_UP);
}

export function compareClinicalDecimals(
  left: Decimal,
  right: Decimal,
): -1 | 0 | 1 {
  if (left.lessThan(right)) {
    return -1;
  }

  if (left.greaterThan(right)) {
    return 1;
  }

  return 0;
}

export function isClinicalDecimalZero(value: Decimal): boolean {
  return value.isZero();
}

export function isClinicalDecimalPositive(value: Decimal): boolean {
  return value.greaterThan(0);
}

export function isClinicalDecimalNegative(value: Decimal): boolean {
  return value.lessThan(0);
}

export function decimalFromPrisma(value: Decimal): Decimal {
  return new Decimal(value.toString());
}

function assertScale(value: Decimal, fieldName: string, maxScale: number): void {
  const decimalPlaces = countDecimalPlaces(value.toString());

  if (decimalPlaces > maxScale) {
    throw new AnthropometricMeasurementDomainError(
      fieldName,
      `precision exceeds ${maxScale} decimal places`,
    );
  }
}

function countDecimalPlaces(value: string): number {
  const dotIndex = value.indexOf('.');

  if (dotIndex === -1) {
    return 0;
  }

  return value.length - dotIndex - 1;
}
