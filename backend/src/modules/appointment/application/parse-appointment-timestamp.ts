import { DomainError } from '../domain/errors/domain-error.js';

const TIMEZONE_REQUIRED_PATTERN =
  /(Z|[+-]\d{2}:\d{2}|[+-]\d{4})$/;

export function parseAppointmentTimestamp(value: string): Date {
  const normalized = value?.trim();

  if (!normalized) {
    throw new DomainError('Appointment timestamp is required.');
  }

  if (!TIMEZONE_REQUIRED_PATTERN.test(normalized)) {
    throw new DomainError(
      'Appointment timestamp must include a timezone or UTC offset.',
    );
  }

  const parsed = new Date(normalized);

  if (Number.isNaN(parsed.getTime())) {
    throw new DomainError('Appointment timestamp is invalid.');
  }

  return parsed;
}
