import { DomainError } from '../errors/domain-error.js';
import { DoseCustomDisplayRequiredDomainError } from '../errors/dose-custom-display-required.domain-error.js';
import { DoseQuantity } from './dose-quantity.js';
import { DoseUnit } from './dose-unit.js';

export const DOSE_UNIT_CUSTOM_DISPLAY_MAX_LENGTH = 100;

export class Dose {
  private constructor(
    private readonly quantity: DoseQuantity | null,
    private readonly unit: DoseUnit | null,
    private readonly customDisplay: string | null,
  ) {}

  static empty(): Dose {
    return new Dose(null, null, null);
  }

  static create(params: {
    quantity?: string | null;
    unit?: string | null;
    customDisplay?: string | null;
  }): Dose {
    const quantity = params.quantity
      ? DoseQuantity.create(params.quantity)
      : null;
    const unit = params.unit ? DoseUnit.parse(params.unit) : null;
    const customDisplay = normalizeCustomDisplay(params.customDisplay);

    if (unit?.isOther() && !customDisplay) {
      throw new DoseCustomDisplayRequiredDomainError();
    }

    if (customDisplay && customDisplay.length > DOSE_UNIT_CUSTOM_DISPLAY_MAX_LENGTH) {
      throw new DomainError(
        `Dose unit custom display must not exceed ${DOSE_UNIT_CUSTOM_DISPLAY_MAX_LENGTH} characters.`,
      );
    }

    return new Dose(quantity, unit, customDisplay);
  }

  static fromPersistence(params: {
    quantity: DoseQuantity | null;
    unit: DoseUnit | null;
    customDisplay: string | null;
  }): Dose {
    return new Dose(params.quantity, params.unit, params.customDisplay);
  }

  equals(other: Dose): boolean {
    const quantityEqual =
      (this.quantity === null && other.quantity === null)
      || (this.quantity !== null
        && other.quantity !== null
        && this.quantity.equals(other.quantity));
    const unitEqual =
      (this.unit === null && other.unit === null)
      || (this.unit !== null && other.unit !== null && this.unit.equals(other.unit));

    return quantityEqual && unitEqual && this.customDisplay === other.customDisplay;
  }

  isEmpty(): boolean {
    return this.quantity === null && this.unit === null && this.customDisplay === null;
  }

  isCompleteForEmit(): boolean {
    if (this.quantity === null || this.unit === null) {
      return false;
    }

    if (this.unit.isOther()) {
      return this.customDisplay !== null && this.customDisplay.length > 0;
    }

    return true;
  }

  getQuantity(): DoseQuantity | null {
    return this.quantity;
  }

  getUnit(): DoseUnit | null {
    return this.unit;
  }

  getCustomDisplay(): string | null {
    return this.customDisplay;
  }
}

function normalizeCustomDisplay(value: string | null | undefined): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  const normalized = value.trim().replace(/\s+/g, ' ');

  return normalized.length > 0 ? normalized : null;
}
