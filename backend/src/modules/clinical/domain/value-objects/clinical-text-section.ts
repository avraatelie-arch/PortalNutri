import { DomainError } from '../errors/domain-error.js';
import { normalizeClinicalSectionText } from './normalize-clinical-section-text.js';

export class ClinicalTextSection {
  private constructor(
    private readonly value: string | null,
    private readonly maxLength: number,
  ) {}

  static empty(maxLength: number): ClinicalTextSection {
    return new ClinicalTextSection(null, maxLength);
  }

  static create(
    raw: string | null | undefined,
    maxLength: number,
  ): ClinicalTextSection {
    if (raw === null || raw === undefined) {
      return ClinicalTextSection.empty(maxLength);
    }

    const normalized = normalizeClinicalSectionText(raw);

    if (normalized === null) {
      return ClinicalTextSection.empty(maxLength);
    }

    if (normalized.length > maxLength) {
      throw new DomainError(
        `Clinical text section must not exceed ${maxLength} characters.`,
      );
    }

    return new ClinicalTextSection(normalized, maxLength);
  }

  static fromPersistence(
    value: string | null | undefined,
    maxLength: number,
  ): ClinicalTextSection {
    if (value === null || value === undefined) {
      return ClinicalTextSection.empty(maxLength);
    }

    return new ClinicalTextSection(value, maxLength);
  }

  equals(other: ClinicalTextSection): boolean {
    return this.value === other.value;
  }

  isEmpty(): boolean {
    return this.value === null;
  }

  toPersistence(): string | null {
    return this.value;
  }

  getMaxLength(): number {
    return this.maxLength;
  }
}
