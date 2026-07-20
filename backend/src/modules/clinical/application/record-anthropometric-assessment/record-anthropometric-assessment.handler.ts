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
import { createAnthropometryClinicalRecordContextErrors } from '../anthropometry-clinical-record-context.errors.js';
import { toAnthropometricAssessmentResult } from '../anthropometric-assessment-result.js';
import { buildClinicalRecordContext } from '../clinical-record-context.js';
import { executeAnthropometryUseCase } from '../execute-anthropometry-use-case.js';
import { AnthropometricAssessmentDuplicateRequestError } from '../errors/anthropometric-assessment-duplicate-request.error.js';
import type { AnamnesisDirectoryPort } from '../ports/anamnesis-directory.port.js';
import type { ClinicalEncounterDirectoryPort } from '../ports/clinical-encounter-directory.port.js';
import type { Clock } from '../ports/clock.port.js';
import type { NutritionistDirectoryPort } from '../ports/nutritionist-directory.port.js';
import type { PatientClinicalDirectoryPort } from '../ports/patient-clinical-directory.port.js';
import type { TenantDirectoryPort } from '../ports/tenant-directory.port.js';
import { RecordAnthropometricAssessmentCommand } from './record-anthropometric-assessment.command.js';

export class RecordAnthropometricAssessmentHandler {
  private readonly bodyMassIndexCalculator = new BodyMassIndexCalculator();
  private readonly waistToHipRatioCalculator = new WaistToHipRatioCalculator();
  private readonly clinicalRecordContextErrors =
    createAnthropometryClinicalRecordContextErrors();

  constructor(
    private readonly anthropometricAssessmentRepository: AnthropometricAssessmentRepository,
    private readonly tenantDirectory: TenantDirectoryPort,
    private readonly anamnesisDirectory: AnamnesisDirectoryPort,
    private readonly clinicalEncounterDirectory: ClinicalEncounterDirectoryPort,
    private readonly patientClinicalDirectory: PatientClinicalDirectoryPort,
    private readonly nutritionistDirectory: NutritionistDirectoryPort,
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

      const context = await buildClinicalRecordContext({
        tenantDirectory: this.tenantDirectory,
        anamnesisDirectory: this.anamnesisDirectory,
        clinicalEncounterDirectory: this.clinicalEncounterDirectory,
        patientClinicalDirectory: this.patientClinicalDirectory,
        nutritionistDirectory: this.nutritionistDirectory,
        clock: this.clock,
        request: {
          tenantId,
          anamnesisId,
          clinicalEncounterId,
          patientId,
          nutritionistId,
          measuredAt,
        },
        errors: this.clinicalRecordContextErrors,
      });

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
          birthDate: context.patient.birthDate,
          measuredAt: context.measuredAt,
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
          measuredAt: context.measuredAt,
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
