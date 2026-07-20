import type { BodyCircumference } from '../value-objects/body-circumference.js';
import { roundHalfUp } from '../value-objects/clinical-decimal-utils.js';
import { WaistToHipRatio } from '../value-objects/waist-to-hip-ratio.js';

export class WaistToHipRatioCalculator {
  calculate(
    waist: BodyCircumference | null,
    hip: BodyCircumference | null,
  ): WaistToHipRatio | null {
    if (!waist || !hip) {
      return null;
    }

    if (hip.getValue().isZero()) {
      return null;
    }

    const ratio = waist.getValue().div(hip.getValue());
    const rounded = roundHalfUp(ratio, 3);

    return WaistToHipRatio.fromDecimal(rounded);
  }
}
