import type { Clock } from './ports/clock.port.js';
import { AnthropometricAssessmentBeforeBirthError } from './errors/anthropometric-assessment-before-birth.error.js';
import { AnthropometricAssessmentFutureDateError } from './errors/anthropometric-assessment-future-date.error.js';

export const MEASURED_AT_FUTURE_TOLERANCE_MS = 5 * 60 * 1000;

export function resolveMeasuredAt(
  measuredAt: Date | undefined,
  clock: Clock,
): Date {
  return measuredAt ?? clock.now();
}

export function validateMeasuredAt(
  measuredAt: Date,
  clock: Clock,
  birthDate: Date | null,
  tenantId: string,
  patientId: string,
): void {
  const now = clock.now();

  if (measuredAt.getTime() > now.getTime() + MEASURED_AT_FUTURE_TOLERANCE_MS) {
    throw new AnthropometricAssessmentFutureDateError(tenantId, patientId);
  }

  if (birthDate && measuredAt.getTime() < birthDate.getTime()) {
    throw new AnthropometricAssessmentBeforeBirthError(tenantId, patientId);
  }
}
