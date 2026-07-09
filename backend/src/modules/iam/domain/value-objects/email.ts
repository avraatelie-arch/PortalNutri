import { DomainError } from '../errors/domain-error.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_LENGTH = 320;

export class Email {
  private constructor(private readonly value: string) {}

  static create(value: string): Email {
    const normalized = value?.trim().toLowerCase();

    if (!normalized) {
      throw new DomainError('Email is required.');
    }

    if (normalized.length > MAX_LENGTH) {
      throw new DomainError(`Email must have at most ${MAX_LENGTH} characters.`);
    }

    if (!EMAIL_REGEX.test(normalized)) {
      throw new DomainError('Email must be a valid email address.');
    }

    return new Email(normalized);
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
