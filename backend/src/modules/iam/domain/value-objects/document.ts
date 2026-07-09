import { DomainError } from '../errors/domain-error.js';

export enum DocumentType {
  CPF = 'CPF',
  RG = 'RG',
  CNH = 'CNH',
  PASSPORT = 'PASSPORT',
  OTHER = 'OTHER',
}

const MAX_VALUE_LENGTH = 32;

export class Document {
  private constructor(
    private readonly type: DocumentType,
    private readonly value: string,
  ) {}

  static create(type: DocumentType, value: string): Document {
    const normalizedValue = value?.trim();

    if (!normalizedValue) {
      throw new DomainError('Document value is required.');
    }

    if (!Object.values(DocumentType).includes(type)) {
      throw new DomainError('Document type is invalid.');
    }

    if (normalizedValue.length > MAX_VALUE_LENGTH) {
      throw new DomainError(
        `Document value must have at most ${MAX_VALUE_LENGTH} characters.`,
      );
    }

    if (type === DocumentType.CPF) {
      Document.validateCpf(normalizedValue);
    } else if (!/^[A-Za-z0-9.-]+$/.test(normalizedValue)) {
      throw new DomainError('Document value contains invalid characters.');
    }

    return new Document(type, normalizedValue);
  }

  private static validateCpf(value: string): void {
    const digits = value.replace(/\D/g, '');

    if (digits.length !== 11 || /^(\d)\1+$/.test(digits)) {
      throw new DomainError('CPF document is invalid.');
    }

    const calculateDigit = (slice: string, factor: number): number => {
      let total = 0;

      for (const char of slice) {
        total += Number(char) * factor--;
      }

      const remainder = total % 11;
      return remainder < 2 ? 0 : 11 - remainder;
    };

    const firstDigit = calculateDigit(digits.slice(0, 9), 10);
    const secondDigit = calculateDigit(digits.slice(0, 10), 11);

    if (
      firstDigit !== Number(digits[9]) ||
      secondDigit !== Number(digits[10])
    ) {
      throw new DomainError('CPF document is invalid.');
    }
  }

  getType(): DocumentType {
    return this.type;
  }

  getValue(): string {
    return this.value;
  }

  equals(other: Document): boolean {
    return this.type === other.type && this.value === other.value;
  }

  toString(): string {
    return `${this.type}:${this.value}`;
  }
}
