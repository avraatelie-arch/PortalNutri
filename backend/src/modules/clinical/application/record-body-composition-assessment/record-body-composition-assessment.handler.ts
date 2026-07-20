import { Prisma } from '@prisma/client';
import type { EventDispatcher } from '../../../../core/application/events/event-dispatcher.js';
import { BodyCompositionAssessment } from '../../domain/aggregates/body-composition-assessment.aggregate.js';
import type { BodyCompositionAssessmentRepository } from '../../domain/repositories/body-composition-assessment-repository.js';
import { BodyCompositionConsistencyPolicy } from '../../domain/policies/body-composition-consistency-policy.js';
import { BasalMetabolicRate } from '../../domain/value-objects/basal-metabolic-rate.js';
import { BodyCompositionMeasurementSource } from '../../domain/value-objects/body-composition-measurement-source.js';
import { BodyCompositionNotes } from '../../domain/value-objects/body-composition-notes.js';
import { BodyFatPercentage } from '../../domain/value-objects/body-fat-percentage.js';
import { BodyWaterPercentage } from '../../domain/value-objects/body-water-percentage.js';
import { BoneMass } from '../../domain/value-objects/bone-mass.js';
import { ClinicalSourceRequestId } from '../../domain/value-objects/clinical-source-request-id.js';
import { FatMass } from '../../domain/value-objects/fat-mass.js';
import { LeanMass } from '../../domain/value-objects/lean-mass.js';
import { MetabolicAge } from '../../domain/value-objects/metabolic-age.js';
import { MuscleMass } from '../../domain/value-objects/muscle-mass.js';
import { VisceralFatLevel } from '../../domain/value-objects/visceral-fat-level.js';
import { createBodyCompositionClinicalRecordContextErrors } from '../body-composition-clinical-record-context.errors.js';
import { toBodyCompositionAssessmentResult } from '../body-composition-assessment-result.js';
import { buildClinicalRecordContext } from '../clinical-record-context.js';
import { executeBodyCompositionUseCase } from '../execute-body-composition-use-case.js';
import { AnthropometricAssessmentAnamnesisMismatchForBodyCompositionError } from '../errors/anthropometric-assessment-anamnesis-mismatch-for-body-composition.error.js';
import { AnthropometricAssessmentNotFoundForBodyCompositionError } from '../errors/anthropometric-assessment-not-found-for-body-composition.error.js';
import { AnthropometricAssessmentPatientMismatchForBodyCompositionError } from '../errors/anthropometric-assessment-patient-mismatch-for-body-composition.error.js';
import { AnthropometricAssessmentTenantMismatchForBodyCompositionError } from '../errors/anthropometric-assessment-tenant-mismatch-for-body-composition.error.js';
import { BodyCompositionAssessmentDuplicateRequestError } from '../errors/body-composition-assessment-duplicate-request.error.js';
import type { AnamnesisDirectoryPort } from '../ports/anamnesis-directory.port.js';
import type { AnthropometricAssessmentDirectoryPort } from '../ports/anthropometric-assessment-directory.port.js';
import type { ClinicalEncounterDirectoryPort } from '../ports/clinical-encounter-directory.port.js';
import type { Clock } from '../ports/clock.port.js';
import type { NutritionistDirectoryPort } from '../ports/nutritionist-directory.port.js';
import type { PatientClinicalDirectoryPort } from '../ports/patient-clinical-directory.port.js';
import type { TenantDirectoryPort } from '../ports/tenant-directory.port.js';
import { RecordBodyCompositionAssessmentCommand } from './record-body-composition-assessment.command.js';

export class RecordBodyCompositionAssessmentHandler {
  private readonly clinicalRecordContextErrors =
    createBodyCompositionClinicalRecordContextErrors();

  constructor(
    private readonly bodyCompositionAssessmentRepository: BodyCompositionAssessmentRepository,
    private readonly tenantDirectory: TenantDirectoryPort,
    private readonly anamnesisDirectory: AnamnesisDirectoryPort,
    private readonly clinicalEncounterDirectory: ClinicalEncounterDirectoryPort,
    private readonly patientClinicalDirectory: PatientClinicalDirectoryPort,
    private readonly nutritionistDirectory: NutritionistDirectoryPort,
    private readonly anthropometricAssessmentDirectory: AnthropometricAssessmentDirectoryPort,
    private readonly bodyCompositionConsistencyPolicy: BodyCompositionConsistencyPolicy,
    private readonly clock: Clock,
    private readonly eventDispatcher: EventDispatcher,
  ) {}

  async execute(command: RecordBodyCompositionAssessmentCommand) {
    return executeBodyCompositionUseCase(async () => {
      const {
        tenantId,
        anamnesisId,
        clinicalEncounterId,
        patientId,
        nutritionistId,
        bodyFatPercentage,
        measurementSource,
        leanMassKg,
        fatMassKg,
        muscleMassKg,
        boneMassKg,
        bodyWaterPercentage,
        visceralFatLevel,
        basalMetabolicRate,
        metabolicAge,
        notes,
        anthropometricAssessmentId,
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

      let linkedAnthropometricWeightKg: string | null = null;
      let resolvedAnthropometricAssessmentId: string | null = null;

      if (anthropometricAssessmentId) {
        const anthropometricAssessment =
          await this.anthropometricAssessmentDirectory.findByTenantAndId(
            tenantId,
            anthropometricAssessmentId,
          );

        if (!anthropometricAssessment) {
          throw new AnthropometricAssessmentNotFoundForBodyCompositionError(
            tenantId,
            anthropometricAssessmentId,
          );
        }

        if (anthropometricAssessment.tenantId !== tenantId) {
          throw new AnthropometricAssessmentTenantMismatchForBodyCompositionError(
            tenantId,
            anthropometricAssessmentId,
          );
        }

        if (anthropometricAssessment.anamnesisId !== anamnesisId) {
          throw new AnthropometricAssessmentAnamnesisMismatchForBodyCompositionError(
            tenantId,
            anthropometricAssessmentId,
            anamnesisId,
          );
        }

        if (anthropometricAssessment.patientId !== patientId) {
          throw new AnthropometricAssessmentPatientMismatchForBodyCompositionError(
            tenantId,
            anthropometricAssessmentId,
            patientId,
          );
        }

        linkedAnthropometricWeightKg = anthropometricAssessment.weightKg;
        resolvedAnthropometricAssessmentId = anthropometricAssessmentId;
      }

      const resolvedSourceRequestId =
        ClinicalSourceRequestId.createOptional(sourceRequestId);

      if (resolvedSourceRequestId) {
        const duplicateExists =
          await this.bodyCompositionAssessmentRepository.existsBySourceRequestId(
            tenantId,
            resolvedSourceRequestId.toString(),
          );

        if (duplicateExists) {
          throw new BodyCompositionAssessmentDuplicateRequestError(
            tenantId,
            resolvedSourceRequestId.toString(),
          );
        }
      }

      const bodyFat = BodyFatPercentage.create(bodyFatPercentage);
      const leanMass = LeanMass.createOptional(leanMassKg);
      const fatMass = FatMass.createOptional(fatMassKg);
      const muscleMass = MuscleMass.createOptional(muscleMassKg);
      const boneMass = BoneMass.createOptional(boneMassKg);
      const bodyWater = BodyWaterPercentage.createOptional(bodyWaterPercentage);
      const visceralFat = VisceralFatLevel.createOptional(visceralFatLevel);
      const bmr = BasalMetabolicRate.createOptional(basalMetabolicRate);
      const metabolicAgeValue = MetabolicAge.createOptional(metabolicAge);
      const bodyCompositionNotes = BodyCompositionNotes.create(notes);
      const resolvedMeasurementSource =
        BodyCompositionMeasurementSource.parse(measurementSource);

      this.bodyCompositionConsistencyPolicy.evaluate({
        bodyFatPercentage: bodyFat,
        leanMass,
        fatMass,
        muscleMass,
        boneMass,
        bodyWaterPercentage: bodyWater,
        linkedAnthropometricWeightKg,
      });

      const createdAt = this.clock.now();
      const assessment = BodyCompositionAssessment.create(
        {
          tenantId,
          anamnesisId,
          clinicalEncounterId,
          patientId,
          nutritionistId,
          anthropometricAssessmentId: resolvedAnthropometricAssessmentId,
          bodyFatPercentage: bodyFat,
          leanMass,
          fatMass,
          muscleMass,
          boneMass,
          bodyWaterPercentage: bodyWater,
          visceralFatLevel: visceralFat,
          basalMetabolicRate: bmr,
          metabolicAge: metabolicAgeValue,
          notes: bodyCompositionNotes,
          measurementSource: resolvedMeasurementSource,
          sourceRequestId: resolvedSourceRequestId,
          measuredAt: context.measuredAt,
        },
        createdAt,
      );

      try {
        await this.bodyCompositionAssessmentRepository.save(assessment);
      }
      catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError
          && error.code === 'P2002'
        ) {
          throw new BodyCompositionAssessmentDuplicateRequestError(
            tenantId,
            resolvedSourceRequestId?.toString() ?? 'unknown',
          );
        }

        throw error;
      }

      await this.eventDispatcher.dispatch(assessment.pullDomainEvents());

      return toBodyCompositionAssessmentResult(assessment);
    });
  }
}
