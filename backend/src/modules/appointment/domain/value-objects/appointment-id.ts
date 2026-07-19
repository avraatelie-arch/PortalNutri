import { DomainError } from '../errors/domain-error.js';

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class AppointmentId {
  private constructor(private readonly value: string) {}

  static create(value: string): AppointmentId {
    const normalized = value?.trim();

    if (!normalized) {
      throw new DomainError('AppointmentId is required.');
    }

    if (!UUID_REGEX.test(normalized)) {
      throw new DomainError('AppointmentId must be a valid UUID.');
    }

    return new AppointmentId(normalized);
  }

  static generate(): AppointmentId {
    return new AppointmentId(crypto.randomUUID());
  }

  equals(other: AppointmentId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
