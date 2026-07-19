import { DomainError } from '../errors/domain-error.js';

const MAX_NOTES_LENGTH = 5000;

export class ClinicalNotes {
  private constructor(private readonly value: string | null) {}

  static create(value: string | null | undefined): ClinicalNotes {
    if (value === null || value === undefined) {
      return new ClinicalNotes(null);
    }

    const normalized = normalizeNotes(value);

    if (normalized === null) {
      return new ClinicalNotes(null);
    }

    if (normalized.length > MAX_NOTES_LENGTH) {
      throw new DomainError(
        `Clinical notes must not exceed ${MAX_NOTES_LENGTH} characters.`,
      );
    }

    return new ClinicalNotes(normalized);
  }

  equals(other: ClinicalNotes): boolean {
    return this.value === other.value;
  }

  toString(): string | null {
    return this.value;
  }
}

export function normalizeNotes(value: string): string | null {
  const normalized = value.trim().replace(/\s+/g, ' ');

  if (normalized.length === 0) {
    return null;
  }

  return normalized;
}
