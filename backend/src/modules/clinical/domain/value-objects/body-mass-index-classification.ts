export const BodyMassIndexClassification = {
  Underweight: 'UNDERWEIGHT',
  Normal: 'NORMAL',
  Overweight: 'OVERWEIGHT',
  ObesityClassI: 'OBESITY_CLASS_I',
  ObesityClassII: 'OBESITY_CLASS_II',
  ObesityClassIII: 'OBESITY_CLASS_III',
  PediatricNotSupported: 'PEDIATRIC_NOT_SUPPORTED',
  Unclassified: 'UNCLASSIFIED',
} as const;

export type BodyMassIndexClassification =
  (typeof BodyMassIndexClassification)[keyof typeof BodyMassIndexClassification];

export function parseBodyMassIndexClassification(
  value: string,
): BodyMassIndexClassification {
  const classifications = Object.values(BodyMassIndexClassification);

  if (!classifications.includes(value as BodyMassIndexClassification)) {
    throw new Error(`Invalid body mass index classification: ${value}`);
  }

  return value as BodyMassIndexClassification;
}
