import {
  ClinicalMeasurementDomainError,
  type ClinicalMeasurementReasonCode,
} from './clinical-measurement.domain-error.js';

export class BodyCompositionMeasurementDomainError extends ClinicalMeasurementDomainError {
  constructor(
    fieldName: string,
    reasonCode: ClinicalMeasurementReasonCode,
    details?: string,
  ) {
    super(fieldName, reasonCode, details);
    this.name = 'BodyCompositionMeasurementDomainError';
  }
}
