import { DomainError } from '../errors/domain-error.js';

const MIN_LENGTH = 2;
const MAX_LENGTH = 200;

export class RoleName {
  private constructor(private readonly value: string) {}

  static create(value: string): RoleName {
    const trimmed = value?.trim();

    if (!trimmed) {
      throw new DomainError('RoleName is required.');
    }

    const collapsed = trimmed.replace(/\s+/g, ' ');

    if (collapsed.length < MIN_LENGTH) {
      throw new DomainError(
        `RoleName must have at least ${MIN_LENGTH} characters.`,
      );
    }

    if (collapsed.length > MAX_LENGTH) {
      throw new DomainError(
        `RoleName must have at most ${MAX_LENGTH} characters.`,
      );
    }

    return new RoleName(collapsed);
  }

  equals(other: RoleName): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
