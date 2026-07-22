import { DomainError } from '../errors/domain-error.js';

export const OutcomeTrackingStatusValue = {
  Draft: 'DRAFT',
  Recorded: 'RECORDED',
  Cancelled: 'CANCELLED',
} as const;

export type OutcomeTrackingStatus =
  (typeof OutcomeTrackingStatusValue)[keyof typeof OutcomeTrackingStatusValue];

export function parseOutcomeTrackingStatus(value: string): OutcomeTrackingStatus {
  const normalized = value?.trim().toUpperCase();

  if (
    !Object.values(OutcomeTrackingStatusValue).includes(
      normalized as OutcomeTrackingStatus,
    )
  ) {
    throw new DomainError(`Invalid outcome tracking status: ${value}.`);
  }

  return normalized as OutcomeTrackingStatus;
}

export function isTerminalOutcomeTrackingStatus(
  status: OutcomeTrackingStatus,
): boolean {
  return status === OutcomeTrackingStatusValue.Cancelled;
}

export function isMutableOutcomeTrackingStatus(
  status: OutcomeTrackingStatus,
): boolean {
  return !isTerminalOutcomeTrackingStatus(status);
}
