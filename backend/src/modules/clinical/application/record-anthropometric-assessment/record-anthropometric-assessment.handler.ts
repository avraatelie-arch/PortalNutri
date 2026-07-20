import { Prisma } from '@prisma/client';
import type { EventDispatcher } from '../../../../core/application/events/event-dispatcher.js';
import { AnthropometricAssessment } from '../../domain/aggregates/anthropometric-assessment.aggregate.js';
import type { AnthropometricAssessmentRepository } from '../../domain/repositories/anthropometric-assessment-repository.js';
import type { BodyMassIndexClassificationPolicy } from '../../domain/policies/body-mass-index-classification-policy.js';
import { BodyMassIndexCalculator } from '../../domain/services/body-mass-index-calculator.js';
import { WaistToHipRatioCalculator } from '../../domain/services/waist-to-hip-ratio-calculator.js';
import { AnthropometricNotes } from '../../domain/value-objects/anthropometric-notes.js';
import { BodyCircumference } from '../../domain/value-objects/body-circumference.js';
import { BodyHeight } from '../../domain/value-objects/body-height.js';
import { BodyWeight } from '../../domain/value-objects/body-weight.js';
import { ClinicalSourceRequestId } from '../../domain/value-objects/clinical-source-request-id.js';
import { toAnthropometricAssessmentResult } from '../anthropometric-assessment-result.js';
import { executeAnthropometryUseCase } from '../execute-anthropometry-use-case.js';
import { AnamnesisClinicalEncounterMismatchError } from '../errors/anamnesis-clinical-encounter-mismatch.error.js';
import { AnamnesisNotDraftForAnthropometryError } from '../errors/anamnesis-not-draft-for-anthropometry.error.js';
import { AnamnesisNotFoundForAnthropometryError } from '../errors/anamnesis-not-found-for-anthropometry.error.js';
import { AnamnesisNutritionistMismatchError } from '../errors/anamnesis-nutritionist-mismatch.error.js';
import { AnamnesisPatientMismatchError } from '../errors/anamnesis-patient-mismatch.error.js';
import { AnthropometricAssessmentDuplicateRequestError } from '../errors/anthropometric-assessment-duplicate-request.error.js';
import { ClinicalEncounterNotFoundForAnthropometryError } from '../errors/clinical-encounter-not-found-for-anthropometry.error.js';
import { ClinicalEncounterNotOpenForAnthropometryError } from '../errors/clinical-encounter-not-open-for-anthropometry.error.js';
import { PatientInactiveForAnthropometryError } from '../errors/patient-inactive-for-anthropometry.error.js';
import { PatientNotFoundForAnthropometryError } from '../errors/patient-not-found-for-anthropometry.error.js';
import { TenantInactiveForAnthropometryError } from '../errors/tenant-inactive-for-anthropometry.error.js';
import { TenantNotFoundForAnthropometryError } from '../errors/tenant-not-found-for-anthropometry.error.js';
import type { AnamnesisDirectoryPort } from '../ports/anamnesis-directory.port.js';
import type { ClinicalEncounterDirectoryPort } from '../ports/clinical-encounter-directory.port.js';
import type { Clock } from '../ports/clock.port.js';
import type { PatientClinicalDirectoryPort } from '../ports/patient-clinical-directory.port.js';
import type { TenantDirectoryPort } from '../ports/tenant-directory.port.js';
import { resolveMeasuredAt, validateMeasuredAt } from '../resolve-measured-at.js';
import { RecordAnthropometricAssessmentCommand } from './record-anthropometric-assessment.command.js';

export class RecordAnthropometricAssessmentHandler {
  private readonly bodyMassIndexCalculator = new BodyMassIndexCalculator();
  private readonly waistToHipRatioCalculator = new WaistToHipRatioCalculator();

  constructor(
    private readonly anthropometricAssessmentRepository: AnthropometricAssessmentRepository,
    private readonly tenantDirectory: TenantDirectoryPort,
    private readonly anamnesisDirectory: AnamnesisDirectoryPort,
    private readonly clinicalEncounterDirectory: ClinicalEncounterDirectoryPort,
    private readonly patientClinicalDirectory: PatientClinicalDirectoryPort,
    private readonly bodyMassIndexClassificationPolicy: BodyMassIndexClassificationPolicy,
    private readonly clock: Clock,
    private readonly eventDispatcher: EventDispatcher,
  ) {}

  async execute(command: RecordAnthropometricAssessmentCommand) {
    return executeAnthropometryUseCase(async () => {
      const {
        tenantId,
        anamnesisId,
        clinicalEncounterId,
        patientId,
        nutritionistId,
        weightKg,
        heightCm,
        waistCircumferenceCm,
        hipCircumferenceCm,
        abdominalCircumferenceCm,
        neckCircumferenceCm,
        armCircumferenceCm,
        calfCircumferenceCm,
        notes,
        measuredAt,
        sourceRequestId,
      } = command.request;

      const tenant = await this.tenantDirectory.findById(tenantId);

      if (!tenant) {
        throw new TenantNotFoundForAnthropometryError(tenantId);
      }

      if (tenant.status !== 'ACTIVE') {
        throw new TenantInactiveForAnthropometryError(tenantId);
      }

      const anamnesis = await this.anamnesisDirectory.findByTenantAndId(
        tenantId,
        anamnesisId,
      );

      if (!anamnesis) {
        throw new AnamnesisNotFoundForAnthropometryError(tenantId, anamnesisId);
      }

      if (anamnesis.status !== 'DRAFT') {
        throw new AnamnesisNotDraftForAnthropometryError(tenantId, anamnesisId);
      }

      if (anamnesis.clinicalEncounterId !== clinicalEncounterId) {
        throw new AnamnesisClinicalEncounterMismatchError(
          tenantId,
          anamnesisId,
          clinicalEncounterId,
        );
      }

      if (anamnesis.patientId !== patientId) {
        throw new AnamnesisPatientMismatchError(tenantId, anamnesisId, patientId);
      }

      if (anamnesis.nutritionistId !== nutritionistId) {
        throw new AnamnesisNutritionistMismatchError(
          tenantId,
          anamnesisId,
          nutritionistId,
        );
      }

      const encounter = await this.clinicalEncounterDirectory.findByTenantAndId(
        tenantId,
        clinicalEncounterId,
      );

      if (!encounter) {
        throw new ClinicalEncounterNotFoundForAnthropometryError(
          tenantId,
          clinicalEncounterId,
        );
      }

      if (encounter.status !== 'OPEN') {
        throw new ClinicalEncounterNotOpenForAnthropometryError(
          tenantId,
          clinicalEncounterId,
        );
      }

      if (encounter.patientId !== patientId) {
        throw new AnamnesisPatientMismatchError(tenantId, anamnesisId, patientId);
      }

      if (encounter.nutritionistId !== nutritionistId) {
        throw new AnamnesisNutritionistMismatchError(
          tenantId,
          anamnesisId,
          nutritionistId,
        );
      }

      const patient = await this.patientClinicalDirectory.findByTenantAndId(
        tenantId,
        patientId,
      );

      if (!patient) {
        throw new PatientNotFoundForAnthropometryError(tenantId, patientId);
      }

      if (patient.status !== 'ACTIVE') {
        throw new PatientInactiveForAnthropometryError(tenantId, patientId);
      }

      const resolvedSourceRequestId =
        ClinicalSourceRequestId.createOptional(sourceRequestId);

      if (resolvedSourceRequestId) {
        const duplicateExists =
          await this.anthropometricAssessmentRepository.existsBySourceRequestId(
            tenantId,
            resolvedSourceRequestId.toString(),
          );

        if (duplicateExists) {
          throw new AnthropometricAssessmentDuplicateRequestError(
            tenantId,
            resolvedSourceRequestId.toString(),
          );
        }
      }

      const resolvedMeasuredAt = resolveMeasuredAt(measuredAt, this.clock);
      validateMeasuredAt(
        resolvedMeasuredAt,
        this.clock,
        patient.birthDate,
        tenantId,
        patientId,
      );

      const weight = BodyWeight.create(weightKg);
      const height = BodyHeight.create(heightCm);
      const waistCircumference = BodyCircumference.createOptional(
        waistCircumferenceCm,
        'waistCircumferenceCm',
      );
      const hipCircumference = BodyCircumference.createOptional(
        hipCircumferenceCm,
        'hipCircumferenceCm',
      );
      const abdominalCircumference = BodyCircumference.createOptional(
        abdominalCircumferenceCm,
        'abdominalCircumferenceCm',
      );
      const neckCircumference = BodyCircumference.createOptional(
        neckCircumferenceCm,
        'neckCircumferenceCm',
      );
      const armCircumference = BodyCircumference.createOptional(
        armCircumferenceCm,
        'armCircumferenceCm',
      );
      const calfCircumference = BodyCircumference.createOptional(
        calfCircumferenceCm,
        'calfCircumferenceCm',
      );
      const anthropometricNotes = AnthropometricNotes.create(notes);
      const bodyMassIndex = this.bodyMassIndexCalculator.calculate(weight, height);
      const bodyMassIndexClassification =
        this.bodyMassIndexClassificationPolicy.classify({
          bmi: bodyMassIndex,
          birthDate: patient.birthDate,
          measuredAt: resolvedMeasuredAt,
        });
      const waistToHipRatio = this.waistToHipRatioCalculator.calculate(
        waistCircumference,
        hipCircumference,
      );

      const createdAt = this.clock.now();
      const assessment = AnthropometricAssessment.create(
        {
          tenantId,
          anamnesisId,
          clinicalEncounterId,
          patientId,
          nutritionistId,
          weight,
          height,
          bodyMassIndex,
          bodyMassIndexClassification,
          waistCircumference,
          hipCircumference,
          abdominalCircumference,
          neckCircumference,
          armCircumference,
          calfCircumference,
          waistToHipRatio,
          notes: anthropometricNotes,
          sourceRequestId: resolvedSourceRequestId,
          measuredAt: resolvedMeasuredAt,
        },
        createdAt,
      );

      try {
        await this.anthropometricAssessmentRepository.save(assessment);
      }
      catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError
          && error.code === 'P2002'
        ) {
          throw new AnthropometricAssessmentDuplicateRequestError(
            tenantId,
            resolvedSourceRequestId?.toString() ?? 'unknown',
          );
        }

        throw error;
      }

      await this.eventDispatcher.dispatch(assessment.pullDomainEvents());

      return toAnthropometricAssessmentResult(assessment);
    });
  }
}
