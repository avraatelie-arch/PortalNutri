import { DomainError } from '../errors/domain-error.js';

const MAX_NOTES_LENGTH = 2000;

export class AppointmentNotes {
  private constructor(private readonly value: string | null) {}

  static create(value: string | null | undefined): AppointmentNotes {
    if (value === null || value === undefined) {
      return new AppointmentNotes(null);
    }

    const normalized = value.trim();

    if (normalized.length === 0) {
      return new AppointmentNotes(null);
    }

    if (normalized.length > MAX_NOTES_LENGTH) {
      throw new DomainError(
        `Appointment notes must not exceed ${MAX_NOTES_LENGTH} characters.`,
      );
    }

    return new AppointmentNotes(normalized);
  }

  equals(other: AppointmentNotes): boolean {
    return this.value === other.value;
  }

  toString(): string | null {
    return this.value;
  }
}
