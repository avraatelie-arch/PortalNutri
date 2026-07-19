import { DomainError } from '../errors/domain-error.js';

export const APPOINTMENT_MIN_DURATION_MS = 15 * 60 * 1000;
export const APPOINTMENT_MAX_DURATION_MS = 240 * 60 * 1000;

export class AppointmentDuration {
  static validate(startsAt: Date, endsAt: Date): void {
    if (endsAt.getTime() <= startsAt.getTime()) {
      throw new DomainError('Appointment end must be after start.');
    }

    const durationMs = endsAt.getTime() - startsAt.getTime();

    if (durationMs < APPOINTMENT_MIN_DURATION_MS) {
      throw new DomainError('Appointment duration must be at least 15 minutes.');
    }

    if (durationMs > APPOINTMENT_MAX_DURATION_MS) {
      throw new DomainError('Appointment duration must not exceed 240 minutes.');
    }
  }
}
