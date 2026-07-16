import { DomainError } from '../errors/domain-error.js';

const MAX_AGE_YEARS = 130;

export class BirthDate {
  private constructor(private readonly value: Date) {}

  static create(value: Date): BirthDate {
    if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
      throw new DomainError('BirthDate must be a valid date.');
    }

    const normalized = BirthDate.normalize(value);
    const today = BirthDate.normalize(new Date());

    if (normalized.getTime() > today.getTime()) {
      throw new DomainError('BirthDate cannot be in the future.');
    }

    const minDate = new Date(today);
    minDate.setFullYear(today.getFullYear() - MAX_AGE_YEARS);

    if (normalized.getTime() < minDate.getTime()) {
      throw new DomainError('BirthDate is out of the allowed range.');
    }

    return new BirthDate(normalized);
  }

  private static normalize(value: Date): Date {
    return new Date(value.getFullYear(), value.getMonth(), value.getDate());
  }

  toDate(): Date {
    return new Date(this.value);
  }

  equals(other: BirthDate): boolean {
    return this.value.getTime() === other.value.getTime();
  }

  toString(): string {
    const year = this.value.getFullYear();
    const month = String(this.value.getMonth() + 1).padStart(2, '0');
    const day = String(this.value.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }
}
