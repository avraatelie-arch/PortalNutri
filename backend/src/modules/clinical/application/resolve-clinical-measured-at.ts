import type { Clock } from './ports/clock.port.js';

export const MEASURED_AT_FUTURE_TOLERANCE_MS = 5 * 60 * 1000;

export interface ClinicalMeasuredAtValidationErrors {
  onFutureDate: () => Error;
  onBeforeBirth: () => Error;
}

export function resolveClinicalMeasuredAt(
  measuredAt: Date | undefined,
  clock: Clock,
): Date {
  return measuredAt ?? clock.now();
}

export function validateClinicalMeasuredAt(
  measuredAt: Date,
  clock: Clock,
  birthDate: Date | null,
  errors: ClinicalMeasuredAtValidationErrors,
): void {
  const now = clock.now();

  if (measuredAt.getTime() > now.getTime() + MEASURED_AT_FUTURE_TOLERANCE_MS) {
    throw errors.onFutureDate();
  }

  if (birthDate && measuredAt.getTime() < birthDate.getTime()) {
    throw errors.onBeforeBirth();
  }
}
