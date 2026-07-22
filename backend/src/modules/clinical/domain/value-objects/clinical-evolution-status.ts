import { DomainError } from '../errors/domain-error.js';

export const ClinicalEvolutionStatusValue = {
  Draft: 'DRAFT',
  Finalized: 'FINALIZED',
  Cancelled: 'CANCELLED',
} as const;

export type ClinicalEvolutionStatus =
  (typeof ClinicalEvolutionStatusValue)[keyof typeof ClinicalEvolutionStatusValue];

export function parseClinicalEvolutionStatus(
  value: string,
): ClinicalEvolutionStatus {
  const normalized = value?.trim().toUpperCase();

  if (
    !Object.values(ClinicalEvolutionStatusValue).includes(
      normalized as ClinicalEvolutionStatus,
    )
  ) {
    throw new DomainError(`Invalid clinical evolution status: ${value}.`);
  }

  return normalized as ClinicalEvolutionStatus;
}

export function isTerminalClinicalEvolutionStatus(
  status: ClinicalEvolutionStatus,
): boolean {
  return status === ClinicalEvolutionStatusValue.Cancelled;
}

export function isMutableClinicalEvolutionStatus(
  status: ClinicalEvolutionStatus,
): boolean {
  return !isTerminalClinicalEvolutionStatus(status);
}
