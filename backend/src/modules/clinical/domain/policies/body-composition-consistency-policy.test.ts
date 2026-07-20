import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  BodyCompositionConsistencyPolicy,
  BodyCompositionConsistencyWarningCode,
  BodyCompositionConsistencyWarningSeverity,
} from './body-composition-consistency-policy.js';
import { BodyFatPercentage } from '../value-objects/body-fat-percentage.js';
import { BodyWaterPercentage } from '../value-objects/body-water-percentage.js';
import { BoneMass } from '../value-objects/bone-mass.js';
import { FatMass } from '../value-objects/fat-mass.js';
import { LeanMass } from '../value-objects/lean-mass.js';
import { MuscleMass } from '../value-objects/muscle-mass.js';

describe('BodyCompositionConsistencyPolicy', () => {
  const policy = new BodyCompositionConsistencyPolicy();

  it('returns immutable warning objects without human messages', () => {
    const warnings = policy.evaluate({
      bodyFatPercentage: BodyFatPercentage.create('22.00'),
      leanMass: LeanMass.create('50.00'),
      fatMass: null,
      muscleMass: MuscleMass.create('55.00'),
      boneMass: null,
      bodyWaterPercentage: null,
      linkedAnthropometricWeightKg: null,
    });

    assert.equal(warnings.length, 1);
    assert.deepEqual(warnings[0], {
      code: BodyCompositionConsistencyWarningCode.MuscleExceedsLeanMass,
      field: 'muscleMassKg',
      severity: BodyCompositionConsistencyWarningSeverity.Warning,
    });
    assert.doesNotMatch(JSON.stringify(warnings), /must|should|approximately/i);
    assert.throws(() => {
      (warnings as unknown as string[]).push('invalid');
    });
  });

  it('warns when fat and lean mass deviate from linked weight', () => {
    const warnings = policy.evaluate({
      bodyFatPercentage: BodyFatPercentage.create('22.00'),
      leanMass: LeanMass.create('50.00'),
      fatMass: FatMass.create('20.00'),
      muscleMass: null,
      boneMass: null,
      bodyWaterPercentage: null,
      linkedAnthropometricWeightKg: '72.50',
    });

    assert.equal(warnings.length, 1);
    assert.equal(warnings[0]?.code, BodyCompositionConsistencyWarningCode.MassSumDeviation);
    assert.equal(warnings[0]?.field, 'leanMassKg');
  });

  it('warns when bone mass exceeds lean mass', () => {
    const warnings = policy.evaluate({
      bodyFatPercentage: BodyFatPercentage.create('22.00'),
      leanMass: LeanMass.create('50.00'),
      fatMass: null,
      muscleMass: null,
      boneMass: BoneMass.create('55.00'),
      bodyWaterPercentage: null,
      linkedAnthropometricWeightKg: null,
    });

    assert.equal(warnings.length, 1);
    assert.equal(warnings[0]?.code, BodyCompositionConsistencyWarningCode.BoneExceedsLeanMass);
  });

  it('returns no warnings for consistent values', () => {
    const warnings = policy.evaluate({
      bodyFatPercentage: BodyFatPercentage.create('22.00'),
      leanMass: LeanMass.create('50.00'),
      fatMass: FatMass.create('22.00'),
      muscleMass: MuscleMass.create('30.00'),
      boneMass: BoneMass.create('2.50'),
      bodyWaterPercentage: BodyWaterPercentage.create('58.00'),
      linkedAnthropometricWeightKg: '72.00',
    });

    assert.equal(warnings.length, 0);
  });
});
