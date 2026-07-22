import { DomainError } from '../errors/domain-error.js';

export const AdherenceFactorValue = {
  Full: 'FULL',
  Partial: 'PARTIAL',
  Low: 'LOW',
  Unknown: 'UNKNOWN',
} as const;

export type AdherenceFactorValueType =
  (typeof AdherenceFactorValue)[keyof typeof AdherenceFactorValue];

export class AdherenceFactor {
  private constructor(private readonly value: AdherenceFactorValueType) {}

  static parse(value: string): AdherenceFactor {
    const normalized = value?.trim().toUpperCase();

    if (
      !Object.values(AdherenceFactorValue).includes(
        normalized as AdherenceFactorValueType,
      )
    ) {
      throw new DomainError(`Invalid adherence factor: ${value}.`);
    }

    return new AdherenceFactor(normalized as AdherenceFactorValueType);
  }

  toString(): AdherenceFactorValueType {
    return this.value;
  }

  equals(other: AdherenceFactor): boolean {
    return this.value === other.value;
  }
}
