import { DomainError } from '../errors/domain-error.js';

export const DoseUnitValue = {
  Mg: 'MG',
  G: 'G',
  Mcg: 'MCG',
  Ml: 'ML',
  L: 'L',
  Iu: 'IU',
  Ui: 'UI',
  Capsule: 'CAPSULE',
  Tablet: 'TABLET',
  Sachet: 'SACHET',
  Scoop: 'SCOOP',
  Drop: 'DROP',
  Application: 'APPLICATION',
  Unit: 'UNIT',
  Other: 'OTHER',
} as const;

export type DoseUnitValueType = (typeof DoseUnitValue)[keyof typeof DoseUnitValue];

export class DoseUnit {
  private constructor(private readonly value: DoseUnitValueType) {}

  static parse(value: string): DoseUnit {
    const normalized = value?.trim().toUpperCase();

    if (
      !Object.values(DoseUnitValue).includes(normalized as DoseUnitValueType)
    ) {
      throw new DomainError(`Invalid dose unit: ${value}.`);
    }

    return new DoseUnit(normalized as DoseUnitValueType);
  }

  static fromPersistence(value: string | null | undefined): DoseUnit | null {
    if (value === null || value === undefined) {
      return null;
    }

    return DoseUnit.parse(value);
  }

  isOther(): boolean {
    return this.value === DoseUnitValue.Other;
  }

  equals(other: DoseUnit): boolean {
    return this.value === other.value;
  }

  toPersistence(): DoseUnitValueType {
    return this.value;
  }
}
