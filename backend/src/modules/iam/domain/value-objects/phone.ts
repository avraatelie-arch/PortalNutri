import { DomainError } from '../errors/domain-error.js';

const MIN_DIGITS = 8;
const MAX_LENGTH = 20;

export class Phone {
  private constructor(private readonly value: string) {}

  static create(value: string): Phone {
    const normalized = value?.trim();

    if (!normalized) {
      throw new DomainError('Phone is required.');
    }

    if (normalized.length > MAX_LENGTH) {
      throw new DomainError(`Phone must have at most ${MAX_LENGTH} characters.`);
    }

    if (!/^\+?[0-9\s()-]+$/.test(normalized)) {
      throw new DomainError('Phone contains invalid characters.');
    }

    const digits = normalized.replace(/\D/g, '');

    if (digits.length < MIN_DIGITS) {
      throw new DomainError(`Phone must have at least ${MIN_DIGITS} digits.`);
    }

    return new Phone(normalized);
  }

  static createOptional(value?: string | null): Phone | null {
    if (!value?.trim()) {
      return null;
    }

    return Phone.create(value);
  }

  equals(other: Phone): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
