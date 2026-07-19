export const ClinicalEncounterStatus = {
  Open: 'OPEN',
  Finished: 'FINISHED',
  Cancelled: 'CANCELLED',
} as const;

export type ClinicalEncounterStatus =
  (typeof ClinicalEncounterStatus)[keyof typeof ClinicalEncounterStatus];
