import { DomainError } from '../errors/domain-error.js';

export const ClinicalObjectiveStatusValue = {
  Draft: 'DRAFT',
  Active: 'ACTIVE',
  Paused: 'PAUSED',
  Completed: 'COMPLETED',
  Cancelled: 'CANCELLED',
} as const;

export type ClinicalObjectiveStatus =
  (typeof ClinicalObjectiveStatusValue)[keyof typeof ClinicalObjectiveStatusValue];

export function parseClinicalObjectiveStatus(value: string): ClinicalObjectiveStatus {
  const normalized = value?.trim().toUpperCase();

  if (
    !Object.values(ClinicalObjectiveStatusValue).includes(
      normalized as ClinicalObjectiveStatus,
    )
  ) {
    throw new DomainError(`Invalid clinical objective status: ${value}.`);
  }

  return normalized as ClinicalObjectiveStatus;
}

export function isTerminalClinicalObjectiveStatus(
  status: ClinicalObjectiveStatus,
): boolean {
  return (
    status === ClinicalObjectiveStatusValue.Completed ||
    status === ClinicalObjectiveStatusValue.Cancelled
  );
}

export function isMutableClinicalObjectiveStatus(
  status: ClinicalObjectiveStatus,
): boolean {
  return !isTerminalClinicalObjectiveStatus(status);
}
