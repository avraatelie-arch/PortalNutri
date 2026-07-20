import { Decimal } from '@prisma/client/runtime/library';
import type { BodyFatPercentage } from '../value-objects/body-fat-percentage.js';
import type { BodyWaterPercentage } from '../value-objects/body-water-percentage.js';
import type { BoneMass } from '../value-objects/bone-mass.js';
import type { FatMass } from '../value-objects/fat-mass.js';
import type { LeanMass } from '../value-objects/lean-mass.js';
import type { MuscleMass } from '../value-objects/muscle-mass.js';
import { parseClinicalDecimal } from '../value-objects/clinical-decimal-utils.js';

export const BodyCompositionConsistencyWarningCode = {
  MassSumDeviation: 'MASS_SUM_DEVIATION',
  MuscleExceedsLeanMass: 'MUSCLE_EXCEEDS_LEAN_MASS',
  BoneExceedsLeanMass: 'BONE_EXCEEDS_LEAN_MASS',
  BodyFatPercentageExceedsMaximum: 'BODY_FAT_PERCENTAGE_EXCEEDS_MAXIMUM',
  BodyWaterPercentageExceedsMaximum: 'BODY_WATER_PERCENTAGE_EXCEEDS_MAXIMUM',
} as const;

export type BodyCompositionConsistencyWarningCode =
  (typeof BodyCompositionConsistencyWarningCode)[keyof typeof BodyCompositionConsistencyWarningCode];

export const BodyCompositionConsistencyWarningSeverity = {
  Warning: 'WARNING',
} as const;

export type BodyCompositionConsistencyWarningSeverity =
  (typeof BodyCompositionConsistencyWarningSeverity)[keyof typeof BodyCompositionConsistencyWarningSeverity];

export interface BodyCompositionConsistencyWarning {
  readonly code: BodyCompositionConsistencyWarningCode;
  readonly field: string;
  readonly severity: BodyCompositionConsistencyWarningSeverity;
}

export interface BodyCompositionConsistencyInput {
  bodyFatPercentage: BodyFatPercentage;
  leanMass: LeanMass | null;
  fatMass: FatMass | null;
  muscleMass: MuscleMass | null;
  boneMass: BoneMass | null;
  bodyWaterPercentage: BodyWaterPercentage | null;
  linkedAnthropometricWeightKg: string | null;
}

export interface BodyCompositionConsistencyPolicyConfig {
  massEpsilonKg: Decimal;
  maxPercentage: Decimal;
}

const DEFAULT_CONFIG: BodyCompositionConsistencyPolicyConfig = {
  massEpsilonKg: new Decimal('0.5'),
  maxPercentage: new Decimal('100'),
};

export class BodyCompositionConsistencyPolicy {
  constructor(
    private readonly config: BodyCompositionConsistencyPolicyConfig = DEFAULT_CONFIG,
  ) {}

  evaluate(input: BodyCompositionConsistencyInput): readonly BodyCompositionConsistencyWarning[] {
    const warnings: BodyCompositionConsistencyWarning[] = [];

    this.checkPercentageMaximum(
      input.bodyFatPercentage.getValue(),
      'bodyFatPercentage',
      BodyCompositionConsistencyWarningCode.BodyFatPercentageExceedsMaximum,
      warnings,
    );

    if (input.bodyWaterPercentage !== null) {
      this.checkPercentageMaximum(
        input.bodyWaterPercentage.getValue(),
        'bodyWaterPercentage',
        BodyCompositionConsistencyWarningCode.BodyWaterPercentageExceedsMaximum,
        warnings,
      );
    }

    if (
      input.fatMass !== null
      && input.leanMass !== null
      && input.linkedAnthropometricWeightKg !== null
    ) {
      const linkedWeight = parseClinicalDecimal(
        input.linkedAnthropometricWeightKg,
        'linkedAnthropometricWeightKg',
        2,
      );
      const compositionSum = input.fatMass.getValue().plus(input.leanMass.getValue());
      const deviation = compositionSum.minus(linkedWeight).abs();

      if (deviation.greaterThan(this.config.massEpsilonKg)) {
        warnings.push({
          code: BodyCompositionConsistencyWarningCode.MassSumDeviation,
          field: 'leanMassKg',
          severity: BodyCompositionConsistencyWarningSeverity.Warning,
        });
      }
    }

    if (input.muscleMass !== null && input.leanMass !== null) {
      const leanMassWithEpsilon = input.leanMass.getValue().plus(this.config.massEpsilonKg);

      if (input.muscleMass.getValue().greaterThan(leanMassWithEpsilon)) {
        warnings.push({
          code: BodyCompositionConsistencyWarningCode.MuscleExceedsLeanMass,
          field: 'muscleMassKg',
          severity: BodyCompositionConsistencyWarningSeverity.Warning,
        });
      }
    }

    if (input.boneMass !== null && input.leanMass !== null) {
      const leanMassWithEpsilon = input.leanMass.getValue().plus(this.config.massEpsilonKg);

      if (input.boneMass.getValue().greaterThan(leanMassWithEpsilon)) {
        warnings.push({
          code: BodyCompositionConsistencyWarningCode.BoneExceedsLeanMass,
          field: 'boneMassKg',
          severity: BodyCompositionConsistencyWarningSeverity.Warning,
        });
      }
    }

    return Object.freeze(warnings);
  }

  private checkPercentageMaximum(
    value: Decimal,
    field: string,
    code: BodyCompositionConsistencyWarningCode,
    warnings: BodyCompositionConsistencyWarning[],
  ): void {
    if (value.greaterThan(this.config.maxPercentage)) {
      warnings.push({
        code,
        field,
        severity: BodyCompositionConsistencyWarningSeverity.Warning,
      });
    }
  }
}
