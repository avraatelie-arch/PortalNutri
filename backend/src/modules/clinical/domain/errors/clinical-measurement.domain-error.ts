import { DomainError } from './domain-error.js';

export const ClinicalMeasurementReasonCode = {
  REQUIRED: 'REQUIRED',
  INVALID_DECIMAL_FORMAT: 'INVALID_DECIMAL_FORMAT',
  NOT_FINITE: 'NOT_FINITE',
  PRECISION_EXCEEDED: 'PRECISION_EXCEEDED',
  MUST_BE_GREATER_THAN_ZERO: 'MUST_BE_GREATER_THAN_ZERO',
  EXCEEDS_MAXIMUM: 'EXCEEDS_MAXIMUM',
  BELOW_MINIMUM: 'BELOW_MINIMUM',
  EXCEEDS_MAX_LENGTH: 'EXCEEDS_MAX_LENGTH',
  INVALID_CHARACTERS: 'INVALID_CHARACTERS',
} as const;

export type ClinicalMeasurementReasonCode =
  (typeof ClinicalMeasurementReasonCode)[keyof typeof ClinicalMeasurementReasonCode];

export class ClinicalMeasurementDomainError extends DomainError {
  constructor(
    readonly fieldName: string,
    readonly reasonCode: ClinicalMeasurementReasonCode,
    readonly details?: string,
  ) {
    super(formatClinicalMeasurementErrorMessage(fieldName, reasonCode, details));
    this.name = 'ClinicalMeasurementDomainError';
  }
}

function formatClinicalMeasurementErrorMessage(
  fieldName: string,
  reasonCode: ClinicalMeasurementReasonCode,
  details?: string,
): string {
  switch (reasonCode) {
    case ClinicalMeasurementReasonCode.REQUIRED:
      return `Invalid ${fieldName}: value is required`;
    case ClinicalMeasurementReasonCode.INVALID_DECIMAL_FORMAT:
      return `Invalid ${fieldName}: invalid decimal format`;
    case ClinicalMeasurementReasonCode.NOT_FINITE:
      return `Invalid ${fieldName}: must be a finite number`;
    case ClinicalMeasurementReasonCode.PRECISION_EXCEEDED:
      return `Invalid ${fieldName}: precision exceeds ${details} decimal places`;
    case ClinicalMeasurementReasonCode.MUST_BE_GREATER_THAN_ZERO:
      return `Invalid ${fieldName}: must be greater than zero`;
    case ClinicalMeasurementReasonCode.EXCEEDS_MAXIMUM:
      return `Invalid ${fieldName}: exceeds maximum allowed value`;
    case ClinicalMeasurementReasonCode.BELOW_MINIMUM:
      return `Invalid ${fieldName}: is below minimum allowed value`;
    case ClinicalMeasurementReasonCode.EXCEEDS_MAX_LENGTH:
      return `Invalid ${fieldName}: exceeds maximum length of ${details} characters`;
    case ClinicalMeasurementReasonCode.INVALID_CHARACTERS:
      return `Invalid ${fieldName}: contains invalid characters`;
    default:
      return `Invalid ${fieldName}: ${reasonCode}`;
  }
}
