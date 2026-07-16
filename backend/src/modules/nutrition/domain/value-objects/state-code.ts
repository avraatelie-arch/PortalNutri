import { DomainError } from '../errors/domain-error.js';

const BRAZILIAN_STATE_CODES = new Set([
  'AC',
  'AL',
  'AP',
  'AM',
  'BA',
  'CE',
  'DF',
  'ES',
  'GO',
  'MA',
  'MT',
  'MS',
  'MG',
  'PA',
  'PB',
  'PR',
  'PE',
  'PI',
  'RJ',
  'RN',
  'RS',
  'RO',
  'RR',
  'SC',
  'SP',
  'SE',
  'TO',
]);

export class StateCode {
  private constructor(private readonly value: string) {}

  static create(value: string): StateCode {
    const normalized = value?.trim().toUpperCase();

    if (!normalized) {
      throw new DomainError('StateCode is required.');
    }

    if (normalized.length !== 2) {
      throw new DomainError('StateCode must be a 2-letter Brazilian UF code.');
    }

    if (!BRAZILIAN_STATE_CODES.has(normalized)) {
      throw new DomainError('StateCode must be a valid Brazilian UF code.');
    }

    return new StateCode(normalized);
  }

  equals(other: StateCode): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
