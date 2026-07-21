import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';
import type { Env } from '../config/env.js';
import {
  getPlatformEventRuntime,
  resetPlatformEventRuntimeForTests,
} from '../core/composition/platform-event-runtime.js';
import { createIamDependencies } from '../modules/iam/iam.module.js';
import { createNutritionDependencies } from '../modules/nutrition/nutrition.module.js';
import { createPatientDependencies } from '../modules/patient/patient.module.js';
import { createAppointmentDependencies } from '../modules/appointment/appointment.module.js';
import { createClinicalDependencies } from '../modules/clinical/clinical.module.js';

const mockEnv = {
  NODE_ENV: 'test',
  PORT: 3333,
  HOST: '0.0.0.0',
  LOG_LEVEL: 'silent',
  DATABASE_URL: 'postgresql://user:pass@localhost:5432/portalnutri',
  CORS_ORIGIN: '*',
  JWT_SECRET: 'test-jwt-secret-with-32-characters-min',
  JWT_ISSUER: 'portalnutri',
  JWT_ACCESS_TOKEN_TTL: '15m',
  JWT_REFRESH_TOKEN_TTL: '7d',
  JWT_SESSION_TTL: '30d',
  ARGON2_MEMORY_COST: 65536,
  ARGON2_TIME_COST: 3,
  ARGON2_PARALLELISM: 4,
} as Env;

describe('Platform event runtime composition', () => {
  beforeEach(() => {
    resetPlatformEventRuntimeForTests();
  });

  it('reuses one shared EventDispatcher across IAM, Nutrition, Patient, Appointment and Clinical modules', () => {
    const runtime = getPlatformEventRuntime();
    const iam = createIamDependencies(mockEnv, runtime.eventDispatcher);
    const nutrition = createNutritionDependencies(mockEnv, runtime.eventDispatcher);
    const patient = createPatientDependencies(mockEnv, runtime.eventDispatcher);
    const appointment = createAppointmentDependencies(mockEnv, runtime.eventDispatcher);
    const clinical = createClinicalDependencies(mockEnv, runtime.eventDispatcher);

    assert.equal(iam.eventDispatcher, runtime.eventDispatcher);
    assert.equal(getPlatformEventRuntime().eventDispatcher, runtime.eventDispatcher);
    assert.notEqual(nutrition.nutritionistHandlers, undefined);
    assert.notEqual(patient.patientHandlers, undefined);
    assert.notEqual(patient.patientNutritionistAssignmentHandlers, undefined);
    assert.notEqual(appointment.appointmentHandlers, undefined);
    assert.notEqual(clinical.clinicalHandlers, undefined);
    assert.notEqual(
      clinical.clinicalHandlers.recordAnthropometricAssessmentHandler,
      undefined,
    );
    assert.notEqual(
      clinical.clinicalHandlers.recordBodyCompositionAssessmentHandler,
      undefined,
    );
    assert.notEqual(
      clinical.clinicalHandlers.createClinicalObjectiveHandler,
      undefined,
    );
    assert.notEqual(
      clinical.clinicalHandlers.createNutritionDiagnosisHandler,
      undefined,
    );
    assert.notEqual(
      clinical.clinicalHandlers.confirmNutritionDiagnosisHandler,
      undefined,
    );
    assert.notEqual(
      clinical.clinicalHandlers.createMealPlanHandler,
      undefined,
    );
    assert.notEqual(
      clinical.clinicalHandlers.activateMealPlanHandler,
      undefined,
    );
  });

  it('does not instantiate a second Event Bus when modules use default runtime', () => {
    const firstRuntime = getPlatformEventRuntime();
    const iam = createIamDependencies(mockEnv);
    const secondRuntime = getPlatformEventRuntime();

    assert.equal(iam.eventDispatcher, firstRuntime.eventDispatcher);
    assert.equal(secondRuntime.eventDispatcher, firstRuntime.eventDispatcher);
    assert.equal(secondRuntime.eventHandlerRegistry, firstRuntime.eventHandlerRegistry);
    assert.equal(secondRuntime.auditPublisher, firstRuntime.auditPublisher);
  });
});
