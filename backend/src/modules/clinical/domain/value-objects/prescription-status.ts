import { DomainError } from '../errors/domain-error.js';

export const PrescriptionStatusValue = {
  Draft: 'DRAFT',
  Issued: 'ISSUED',
  Cancelled: 'CANCELLED',
} as const;

export type PrescriptionStatus =
  (typeof PrescriptionStatusValue)[keyof typeof PrescriptionStatusValue];

export function parsePrescriptionStatus(value: string): PrescriptionStatus {
  const normalized = value?.trim().toUpperCase();

  if (
    !Object.values(PrescriptionStatusValue).includes(normalized as PrescriptionStatus)
  ) {
    throw new DomainError(`Invalid prescription status: ${value}.`);
  }

  return normalized as PrescriptionStatus;
}

export function isTerminalPrescriptionStatus(status: PrescriptionStatus): boolean {
  return status === PrescriptionStatusValue.Cancelled;
}

export function isMutablePrescriptionStatus(status: PrescriptionStatus): boolean {
  return !isTerminalPrescriptionStatus(status);
}
