import type { FastifyInstance } from 'fastify';
import type { Env } from '../../config/env.js';
import type { EventDispatcher } from '../../core/application/events/event-dispatcher.js';
import { getPlatformEventRuntime } from '../../core/composition/platform-event-runtime.js';
import { getPrismaClient } from '../../core/database/prisma-client.js';
import {
  createClinicalHandlers,
  type ClinicalHandlers,
} from './composition/clinical.factory.js';
import { SystemClock } from './infrastructure/clock/system-clock.js';
import { DefaultAnamnesisCompletionPolicy } from './domain/policies/anamnesis-completion-policy.js';
import { DefaultBodyMassIndexClassificationPolicy } from './domain/policies/body-mass-index-classification-policy.js';
import { BodyCompositionConsistencyPolicy } from './domain/policies/body-composition-consistency-policy.js';
import { PrismaClinicalEncounterRepository } from './infrastructure/repositories/prisma-clinical-encounter.repository.js';
import { PrismaAnamnesisRepository } from './infrastructure/repositories/prisma-anamnesis.repository.js';
import { PrismaAnthropometricAssessmentRepository } from './infrastructure/repositories/prisma-anthropometric-assessment.repository.js';
import { PrismaBodyCompositionAssessmentRepository } from './infrastructure/repositories/prisma-body-composition-assessment.repository.js';
import { PrismaClinicalObjectiveRepository } from './infrastructure/repositories/prisma-clinical-objective.repository.js';
import { PrismaNutritionDiagnosisRepository } from './infrastructure/repositories/prisma-nutrition-diagnosis.repository.js';
import { PrismaMealPlanRepository } from './infrastructure/repositories/prisma-meal-plan.repository.js';
import { PrismaPrescriptionRepository } from './infrastructure/repositories/prisma-prescription.repository.js';
import { PrismaClinicalEvolutionRepository } from './infrastructure/repositories/prisma-clinical-evolution.repository.js';
import { DefaultEvolutionFinalizationPolicy } from './domain/policies/evolution-finalization-policy.js';
import { PrismaAnthropometricAssessmentDirectoryAdapter } from './infrastructure/adapters/prisma-anthropometric-assessment-directory.adapter.js';
import { PrismaTenantDirectoryAdapter } from './infrastructure/adapters/prisma-tenant-directory.adapter.js';
import { PrismaPatientDirectoryAdapter } from './infrastructure/adapters/prisma-patient-directory.adapter.js';
import { PrismaNutritionistDirectoryAdapter } from './infrastructure/adapters/prisma-nutritionist-directory.adapter.js';
import { PrismaAppointmentDirectoryAdapter } from './infrastructure/adapters/prisma-appointment-directory.adapter.js';
import { PrismaClinicalEncounterDirectoryAdapter } from './infrastructure/adapters/prisma-clinical-encounter-directory.adapter.js';
import { PrismaAnamnesisDirectoryAdapter } from './infrastructure/adapters/prisma-anamnesis-directory.adapter.js';
import { PrismaPatientClinicalDirectoryAdapter } from './infrastructure/adapters/prisma-patient-clinical-directory.adapter.js';

export interface ClinicalDependencies {
  clinicalHandlers: ClinicalHandlers;
}

export function createClinicalDependencies(
  _env: Env,
  eventDispatcher: EventDispatcher = getPlatformEventRuntime().eventDispatcher,
): ClinicalDependencies {
  const prisma = getPrismaClient();

  return {
    clinicalHandlers: createClinicalHandlers({
      encounterRepository: new PrismaClinicalEncounterRepository(prisma),
      anamnesisRepository: new PrismaAnamnesisRepository(prisma),
      anthropometricAssessmentRepository:
        new PrismaAnthropometricAssessmentRepository(prisma),
      bodyCompositionAssessmentRepository:
        new PrismaBodyCompositionAssessmentRepository(prisma),
      clinicalObjectiveRepository: new PrismaClinicalObjectiveRepository(prisma),
      nutritionDiagnosisRepository: new PrismaNutritionDiagnosisRepository(prisma),
      mealPlanRepository: new PrismaMealPlanRepository(prisma),
      prescriptionRepository: new PrismaPrescriptionRepository(prisma),
      clinicalEvolutionRepository: new PrismaClinicalEvolutionRepository(prisma),
      anthropometricAssessmentDirectory:
        new PrismaAnthropometricAssessmentDirectoryAdapter(prisma),
      tenantDirectory: new PrismaTenantDirectoryAdapter(prisma),
      patientDirectory: new PrismaPatientDirectoryAdapter(prisma),
      nutritionistDirectory: new PrismaNutritionistDirectoryAdapter(prisma),
      appointmentDirectory: new PrismaAppointmentDirectoryAdapter(prisma),
      clinicalEncounterDirectory: new PrismaClinicalEncounterDirectoryAdapter(
        prisma,
      ),
      anamnesisDirectory: new PrismaAnamnesisDirectoryAdapter(prisma),
      patientClinicalDirectory: new PrismaPatientClinicalDirectoryAdapter(
        prisma,
      ),
      anamnesisCompletionPolicy: new DefaultAnamnesisCompletionPolicy(),
      evolutionFinalizationPolicy: new DefaultEvolutionFinalizationPolicy(),
      bodyMassIndexClassificationPolicy:
        new DefaultBodyMassIndexClassificationPolicy(),
      bodyCompositionConsistencyPolicy: new BodyCompositionConsistencyPolicy(),
      clock: new SystemClock(),
      eventDispatcher,
    }),
  };
}

export async function registerClinicalModule(
  _app: FastifyInstance,
): Promise<void> {}
