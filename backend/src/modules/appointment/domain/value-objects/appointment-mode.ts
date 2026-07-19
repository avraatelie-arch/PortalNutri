import { DomainError } from '../errors/domain-error.js';

export enum AppointmentModeValue {
  InPerson = 'IN_PERSON',
  Online = 'ONLINE',
}

export class AppointmentMode {
  private constructor(private readonly value: AppointmentModeValue) {}

  static create(value: string): AppointmentMode {
    const normalized = value?.trim().toUpperCase();

    if (
      normalized !== AppointmentModeValue.InPerson &&
      normalized !== AppointmentModeValue.Online
    ) {
      throw new DomainError('AppointmentMode must be IN_PERSON or ONLINE.');
    }

    return new AppointmentMode(normalized as AppointmentModeValue);
  }

  equals(other: AppointmentMode): boolean {
    return this.value === other.value;
  }

  toString(): AppointmentModeValue {
    return this.value;
  }
}
