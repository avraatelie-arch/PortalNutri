import type { Prescription } from '../../domain/aggregates/prescription.aggregate.js';
import {
  compareByEffectiveDate,
  getLatestByEffectiveDate,
  sortByEffectiveDate,
} from './clinical-effective-date-sort.js';

export function comparePrescriptionsByEffectiveDate(
  left: Prescription,
  right: Prescription,
): number {
  return compareByEffectiveDate(left, right);
}

export function sortPrescriptionsByEffectiveDate(
  prescriptions: Prescription[],
): Prescription[] {
  return sortByEffectiveDate(prescriptions);
}

export function getLatestPrescriptionByEffectiveDate(
  prescriptions: Prescription[],
): Prescription | null {
  return getLatestByEffectiveDate(prescriptions);
}
