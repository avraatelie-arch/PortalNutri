import { DomainError } from '../errors/domain-error.js';

export const ClinicalEncounterTypeValue = {
  Initial: 'INITIAL',
  FollowUp: 'FOLLOW_UP',
  Return: 'RETURN',
  Emergency: 'EMERGENCY',
} as const;

export type ClinicalEncounterTypeValue =
  (typeof ClinicalEncounterTypeValue)[keyof typeof ClinicalEncounterTypeValue];

export class ClinicalEncounterType {
  private constructor(private readonly value: ClinicalEncounterTypeValue) {}

  static create(value: string): ClinicalEncounterType {
    const normalized = value?.trim().toUpperCase();

    if (
      !Object.values(ClinicalEncounterTypeValue).includes(
        normalized as ClinicalEncounterTypeValue,
      )
    ) {
      throw new DomainError(`Invalid clinical encounter type: ${value}.`);
    }

    return new ClinicalEncounterType(normalized as ClinicalEncounterTypeValue);
  }

  toString(): ClinicalEncounterTypeValue {
    return this.value;
  }
}
