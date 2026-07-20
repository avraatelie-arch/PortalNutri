import { DomainError } from '../errors/domain-error.js';

export const BodyCompositionMeasurementSourceValue = {
  Manual: 'MANUAL',
  Bioimpedance: 'BIOIMPEDANCE',
  Dexa: 'DEXA',
  Skinfold: 'SKINFOLD',
  Other: 'OTHER',
} as const;

export type BodyCompositionMeasurementSourceValue =
  (typeof BodyCompositionMeasurementSourceValue)[keyof typeof BodyCompositionMeasurementSourceValue];

const DEVICE_GENERATED_SOURCES = new Set<BodyCompositionMeasurementSourceValue>([
  BodyCompositionMeasurementSourceValue.Bioimpedance,
  BodyCompositionMeasurementSourceValue.Dexa,
  BodyCompositionMeasurementSourceValue.Skinfold,
  BodyCompositionMeasurementSourceValue.Other,
]);

export class BodyCompositionMeasurementSource {
  private constructor(private readonly value: BodyCompositionMeasurementSourceValue) {}

  static parse(raw: string): BodyCompositionMeasurementSource {
    const normalized = raw?.trim().toUpperCase();

    if (
      !Object.values(BodyCompositionMeasurementSourceValue).includes(
        normalized as BodyCompositionMeasurementSourceValue,
      )
    ) {
      throw new DomainError(`Invalid body composition measurement source: ${raw}.`);
    }

    return new BodyCompositionMeasurementSource(
      normalized as BodyCompositionMeasurementSourceValue,
    );
  }

  static fromPersistence(value: BodyCompositionMeasurementSourceValue): BodyCompositionMeasurementSource {
    return new BodyCompositionMeasurementSource(value);
  }

  toString(): BodyCompositionMeasurementSourceValue {
    return this.value;
  }

  isDeviceGenerated(): boolean {
    return DEVICE_GENERATED_SOURCES.has(this.value);
  }
}
