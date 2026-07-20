import { Decimal } from '@prisma/client/runtime/library';
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { BodyMassIndex } from '../value-objects/body-mass-index.js';
import { BodyMassIndexClassification } from '../value-objects/body-mass-index-classification.js';
import { DefaultBodyMassIndexClassificationPolicy } from './body-mass-index-classification-policy.js';

const MEASURED_AT = new Date('2026-07-20T10:00:00.000Z');

describe('DefaultBodyMassIndexClassificationPolicy', () => {
  const policy = new DefaultBodyMassIndexClassificationPolicy();

  it('supports only adult ages', () => {
    assert.equal(policy.supports(null), false);
    assert.equal(policy.supports(17), false);
    assert.equal(policy.supports(18), true);
    assert.equal(policy.supports(40), true);
  });

  it('returns UNCLASSIFIED when birth date is unavailable', () => {
    const classification = policy.classify({
      bmi: BodyMassIndex.fromDecimal(new Decimal('24')),
      birthDate: null,
      measuredAt: MEASURED_AT,
    });

    assert.equal(classification, BodyMassIndexClassification.Unclassified);
  });

  it('returns PEDIATRIC_NOT_SUPPORTED for patients under 18', () => {
    const classification = policy.classify({
      bmi: BodyMassIndex.fromDecimal(new Decimal('24')),
      birthDate: new Date('2010-01-01T00:00:00.000Z'),
      measuredAt: MEASURED_AT,
    });

    assert.equal(
      classification,
      BodyMassIndexClassification.PediatricNotSupported,
    );
  });

  it('classifies adult threshold boundaries', () => {
    const birthDate = new Date('1990-01-01T00:00:00.000Z');

    assert.equal(
      policy.classify({
        bmi: BodyMassIndex.fromDecimal(new Decimal('18.49')),
        birthDate,
        measuredAt: MEASURED_AT,
      }),
      BodyMassIndexClassification.Underweight,
    );
    assert.equal(
      policy.classify({
        bmi: BodyMassIndex.fromDecimal(new Decimal('18.5')),
        birthDate,
        measuredAt: MEASURED_AT,
      }),
      BodyMassIndexClassification.Normal,
    );
    assert.equal(
      policy.classify({
        bmi: BodyMassIndex.fromDecimal(new Decimal('24.99')),
        birthDate,
        measuredAt: MEASURED_AT,
      }),
      BodyMassIndexClassification.Normal,
    );
    assert.equal(
      policy.classify({
        bmi: BodyMassIndex.fromDecimal(new Decimal('25')),
        birthDate,
        measuredAt: MEASURED_AT,
      }),
      BodyMassIndexClassification.Overweight,
    );
    assert.equal(
      policy.classify({
        bmi: BodyMassIndex.fromDecimal(new Decimal('29.99')),
        birthDate,
        measuredAt: MEASURED_AT,
      }),
      BodyMassIndexClassification.Overweight,
    );
    assert.equal(
      policy.classify({
        bmi: BodyMassIndex.fromDecimal(new Decimal('30')),
        birthDate,
        measuredAt: MEASURED_AT,
      }),
      BodyMassIndexClassification.ObesityClassI,
    );
    assert.equal(
      policy.classify({
        bmi: BodyMassIndex.fromDecimal(new Decimal('34.99')),
        birthDate,
        measuredAt: MEASURED_AT,
      }),
      BodyMassIndexClassification.ObesityClassI,
    );
    assert.equal(
      policy.classify({
        bmi: BodyMassIndex.fromDecimal(new Decimal('35')),
        birthDate,
        measuredAt: MEASURED_AT,
      }),
      BodyMassIndexClassification.ObesityClassII,
    );
    assert.equal(
      policy.classify({
        bmi: BodyMassIndex.fromDecimal(new Decimal('39.99')),
        birthDate,
        measuredAt: MEASURED_AT,
      }),
      BodyMassIndexClassification.ObesityClassII,
    );
    assert.equal(
      policy.classify({
        bmi: BodyMassIndex.fromDecimal(new Decimal('40')),
        birthDate,
        measuredAt: MEASURED_AT,
      }),
      BodyMassIndexClassification.ObesityClassIII,
    );
  });
});
