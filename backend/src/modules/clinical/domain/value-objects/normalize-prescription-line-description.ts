export function normalizePrescriptionLineDescription(value: string): string {
  return value.trim().replace(/\s+/g, ' ').toLowerCase();
}
