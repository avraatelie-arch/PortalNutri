import { Decimal } from '@prisma/client/runtime/library';
import type { BodyHeight } from '../value-objects/body-height.js';
import { BodyMassIndex } from '../value-objects/body-mass-index.js';
import type { BodyWeight } from '../value-objects/body-weight.js';
import { roundHalfUp } from '../value-objects/clinical-decimal-utils.js';

export class BodyMassIndexCalculator {
  calculate(weight: BodyWeight, height: BodyHeight): BodyMassIndex {
    const heightMeters = height.getValue().div(new Decimal('100'));
    const heightMetersSquared = heightMeters.mul(heightMeters);
    const bmi = weight.getValue().div(heightMetersSquared);
    const rounded = roundHalfUp(bmi, 2);

    return BodyMassIndex.fromDecimal(rounded);
  }
}
