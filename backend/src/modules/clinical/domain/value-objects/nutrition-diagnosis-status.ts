import { DomainError } from '../errors/domain-error.js';

export const NutritionDiagnosisStatusValue = {
  Draft: 'DRAFT',
  Confirmed: 'CONFIRMED',
  Cancelled: 'CANCELLED',
} as const;

export type NutritionDiagnosisStatus =
  (typeof NutritionDiagnosisStatusValue)[keyof typeof NutritionDiagnosisStatusValue];

export function parseNutritionDiagnosisStatus(value: string): NutritionDiagnosisStatus {
  const normalized = value?.trim().toUpperCase();

  if (
    !Object.values(NutritionDiagnosisStatusValue).includes(
      normalized as NutritionDiagnosisStatus,
    )
  ) {
    throw new DomainError(`Invalid nutrition diagnosis status: ${value}.`);
  }

  return normalized as NutritionDiagnosisStatus;
}

export function isTerminalNutritionDiagnosisStatus(
  status: NutritionDiagnosisStatus,
): boolean {
  return status === NutritionDiagnosisStatusValue.Cancelled;
}

export function isMutableNutritionDiagnosisStatus(
  status: NutritionDiagnosisStatus,
): boolean {
  return !isTerminalNutritionDiagnosisStatus(status);
}
