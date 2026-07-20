export const AnamnesisStatus = {
  Draft: 'DRAFT',
  Completed: 'COMPLETED',
} as const;

export type AnamnesisStatus =
  (typeof AnamnesisStatus)[keyof typeof AnamnesisStatus];
