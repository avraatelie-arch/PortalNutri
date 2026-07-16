import { DomainError } from '../errors/domain-error.js';

export enum GenderValue {
  Male = 'MALE',
  Female = 'FEMALE',
  Other = 'OTHER',
  NotInformed = 'NOT_INFORMED',
}

const VALID_VALUES = new Set<string>(Object.values(GenderValue));

export class Gender {
  private constructor(private readonly value: GenderValue) {}

  static create(value: string): Gender {
    const normalized = value?.trim().toUpperCase();

    if (!normalized) {
      throw new DomainError('Gender is required.');
    }

    if (!VALID_VALUES.has(normalized)) {
      throw new DomainError('Gender must be a valid value.');
    }

    return new Gender(normalized as GenderValue);
  }

  equals(other: Gender): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
