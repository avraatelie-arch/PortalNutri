/**
 * Persistence-only normalization for role name uniqueness checks.
 * Not part of the Domain API — used by application handlers and Prisma mappers.
 *
 * Pipeline: trim → collapse internal whitespace → lowercase → Unicode NFKC.
 */
export function normalizeRoleNameForPersistence(name: string): string {
  const trimmed = name.trim();
  const collapsed = trimmed.replace(/\s+/g, ' ');

  return collapsed.normalize('NFKC').toLowerCase();
}
