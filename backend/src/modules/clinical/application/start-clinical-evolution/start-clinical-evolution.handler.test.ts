import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { CapturingEventDispatcher } from '../../../../test-support/capturing-event-dispatcher.js';
import { FixedClock } from '../../../../test-support/fixed-clock.js';
import { noopEventDispatcher } from '../../../../test-support/noop-event-dispatcher.js';
import { ClinicalEncounter } from '../../domain/aggregates/clinical-encounter.aggregate.js';
import { ClinicalEvolution } from '../../domain/aggregates/clinical-evolution.aggregate.js';
import { ClinicalEncounterId } from '../../domain/value-objects/clinical-encounter-id.js';
import { ClinicalEncounterStatus } from '../../domain/value-objects/clinical-encounter-status.js';
import {
  ClinicalEncounterType,
  ClinicalEncounterTypeValue,
} from '../../domain/value-objects/clinical-encounter-type.js';
import { ClinicalEvolutionId } from '../../domain/value-objects/clinical-evolution-id.js';
import { ClinicalEvolutionStatusValue } from '../../domain/value-objects/clinical-evolution-status.js';
import { ClinicalNotes } from '../../domain/value-objects/clinical-notes.js';
import { InMemoryTenantDirectory } from '../../infrastructure/adapters/in-memory-tenant-directory.js';
import { InMemoryClinicalEncounterRepository } from '../../infrastructure/repositories/in-memory-clinical-encounter.repository.js';
import { InMemoryClinicalEvolutionRepository } from '../../infrastructure/repositories/in-memory-clinical-evolution.repository.js';
import { ClinicalEncounterNotFoundForClinicalEvolutionError } from '../errors/clinical-encounter-not-found-for-clinical-evolution.error.js';
import { ClinicalEncounterNotOpenForClinicalEvolutionError } from '../errors/clinical-encounter-not-open-for-clinical-evolution.error.js';
import { ClinicalEncounterNutritionistMismatchForClinicalEvolutionError } from '../errors/clinical-encounter-nutritionist-mismatch-for-clinical-evolution.error.js';
import { ClinicalEncounterPatientMismatchForClinicalEvolutionError } from '../errors/clinical-encounter-patient-mismatch-for-clinical-evolution.error.js';
import { ClinicalEvolutionAlreadyExistsForEncounterError } from '../errors/clinical-evolution-already-exists-for-encounter.error.js';
import { TenantInactiveForClinicalEvolutionError } from '../errors/tenant-inactive-for-clinical-evolution.error.js';
import { TenantNotFoundForClinicalEvolutionError } from '../errors/tenant-not-found-for-clinical-evolution.error.js';
import { StartClinicalEvolutionCommand } from './start-clinical-evolution.command.js';
import { StartClinicalEvolutionHandler } from './start-clinical-evolution.handler.js';

const NOW = new Date('2026-07-20T10:00:00.000Z');
const STARTED_AT = new Date('2026-07-20T09:30:00.000Z');

const TENANT_ID = '550e8400-e29b-41d4-a716-446655440001';
const UNKNOWN_TENANT_ID = '550e8400-e29b-41d4-a716-446655440099';
const PATIENT_ID = '550e8400-e29b-41d4-a716-446655440020';
const OTHER_PATIENT_ID = '550e8400-e29b-41d4-a716-446655440021';
const CREATED_BY_ID = '550e8400-e29b-41d4-a716-446655440030';
const OTHER_NUTRITIONIST_ID = '550e8400-e29b-41d4-a716-446655440031';
const RESPONSIBLE_ID = '550e8400-e29b-41d4-a716-446655440030';
const ENCOUNTER_ID = '550e8400-e29b-41d4-a716-446655440050';
const EVOLUTION_ID = '550e8400-e29b-41d4-a716-446655440070';

function seedTenant(options?: { status?: 'ACTIVE' | 'INACTIVE' }) {
  const tenantDirectory = new InMemoryTenantDirectory();
  tenantDirectory.seed({
    id: TENANT_ID,
    status: options?.status ?? 'ACTIVE',
  });

  return tenantDirectory;
}

async function seedOpenEncounter(
  repository: InMemoryClinicalEncounterRepository,
  options?: {
    status?: ClinicalEncounterStatus;
    patientId?: string;
    nutritionistId?: string;
    startedAt?: Date;
  },
) {
  const encounter = ClinicalEncounter.reconstitute({
    id: ClinicalEncounterId.create(ENCOUNTER_ID),
    tenantId: TENANT_ID,
    appointmentId: null,
    patientId: options?.patientId ?? PATIENT_ID,
    nutritionistId: options?.nutritionistId ?? RESPONSIBLE_ID,
    type: ClinicalEncounterType.create(ClinicalEncounterTypeValue.Initial),
    status: options?.status ?? ClinicalEncounterStatus.Open,
    notes: ClinicalNotes.create(null),
    startedAt: options?.startedAt ?? STARTED_AT,
    finishedAt:
      options?.status === ClinicalEncounterStatus.Finished ? NOW : null,
    createdAt: NOW,
    updatedAt: NOW,
  });

  await repository.save(encounter);
  return encounter;
}

function createHandler(deps: {
  clinicalEvolutionRepository?: InMemoryClinicalEvolutionRepository;
  clinicalEncounterRepository: InMemoryClinicalEncounterRepository;
  tenantDirectory: InMemoryTenantDirectory;
  eventDispatcher?: CapturingEventDispatcher;
}) {
  return new StartClinicalEvolutionHandler(
    deps.clinicalEvolutionRepository ?? new InMemoryClinicalEvolutionRepository(),
    deps.clinicalEncounterRepository,
    deps.tenantDirectory,
    new FixedClock(NOW),
    deps.eventDispatcher ?? noopEventDispatcher,
  );
}

function startCommand(overrides?: {
  patientId?: string;
  responsibleNutritionistId?: string;
  createdByNutritionistId?: string;
  clinicalEncounterId?: string;
}) {
  return new StartClinicalEvolutionCommand({
    tenantId: TENANT_ID,
    clinicalEncounterId: overrides?.clinicalEncounterId ?? ENCOUNTER_ID,
    patientId: overrides?.patientId ?? PATIENT_ID,
    createdByNutritionistId: overrides?.createdByNutritionistId ?? CREATED_BY_ID,
    responsibleNutritionistId: overrides?.responsibleNutritionistId ?? RESPONSIBLE_ID,
  });
}

async function seedExistingEvolution(repository: InMemoryClinicalEvolutionRepository) {
  const evolution = ClinicalEvolution.create({
    id: ClinicalEvolutionId.create(EVOLUTION_ID),
    tenantId: TENANT_ID,
    clinicalEncounterId: ENCOUNTER_ID,
    patientId: PATIENT_ID,
    createdByNutritionistId: CREATED_BY_ID,
    responsibleNutritionistId: RESPONSIBLE_ID,
    clinicalMomentAt: STARTED_AT,
    now: NOW,
  });
  evolution.clearDomainEvents();
  await repository.save(evolution);
  return evolution;
}

describe('StartClinicalEvolutionHandler', () => {
  it('starts clinical evolution when tenant and encounter preconditions are met', async () => {
    const encounterRepository = new InMemoryClinicalEncounterRepository();
    await seedOpenEncounter(encounterRepository);

    const handler = createHandler({
      tenantDirectory: seedTenant(),
      clinicalEncounterRepository: encounterRepository,
    });

    const result = await handler.execute(startCommand());

    assert.equal(result.tenantId, TENANT_ID);
    assert.equal(result.clinicalEncounterId, ENCOUNTER_ID);
    assert.equal(result.patientId, PATIENT_ID);
    assert.equal(result.createdByNutritionistId, CREATED_BY_ID);
    assert.equal(result.responsibleNutritionistId, RESPONSIBLE_ID);
    assert.equal(result.clinicalMomentAt, STARTED_AT.toISOString());
    assert.equal(result.status, ClinicalEvolutionStatusValue.Draft);
    assert.equal(result.version, 1);
    assert.equal(result.subjectiveEvolution, null);
    assert.equal(result.finalizedAt, null);
    assert.equal(result.cancelledAt, null);
    assert.equal(result.createdAt, NOW.toISOString());
    assert.equal(result.updatedAt, NOW.toISOString());
  });

  it('rejects unknown tenant', async () => {
    const encounterRepository = new InMemoryClinicalEncounterRepository();
    await seedOpenEncounter(encounterRepository);

    const handler = createHandler({
      tenantDirectory: new InMemoryTenantDirectory(),
      clinicalEncounterRepository: encounterRepository,
    });

    await assert.rejects(
      () =>
        handler.execute(
          new StartClinicalEvolutionCommand({
            tenantId: UNKNOWN_TENANT_ID,
            clinicalEncounterId: ENCOUNTER_ID,
            patientId: PATIENT_ID,
            createdByNutritionistId: CREATED_BY_ID,
            responsibleNutritionistId: RESPONSIBLE_ID,
          }),
        ),
      TenantNotFoundForClinicalEvolutionError,
    );
  });

  it('rejects inactive tenant', async () => {
    const encounterRepository = new InMemoryClinicalEncounterRepository();
    await seedOpenEncounter(encounterRepository);

    const handler = createHandler({
      tenantDirectory: seedTenant({ status: 'INACTIVE' }),
      clinicalEncounterRepository: encounterRepository,
    });

    await assert.rejects(
      () => handler.execute(startCommand()),
      TenantInactiveForClinicalEvolutionError,
    );
  });

  it('rejects when clinical encounter is not found', async () => {
    const handler = createHandler({
      tenantDirectory: seedTenant(),
      clinicalEncounterRepository: new InMemoryClinicalEncounterRepository(),
    });

    await assert.rejects(
      () => handler.execute(startCommand()),
      ClinicalEncounterNotFoundForClinicalEvolutionError,
    );
  });

  it('rejects when clinical encounter is not OPEN', async () => {
    const encounterRepository = new InMemoryClinicalEncounterRepository();
    await seedOpenEncounter(encounterRepository, {
      status: ClinicalEncounterStatus.Finished,
    });

    const handler = createHandler({
      tenantDirectory: seedTenant(),
      clinicalEncounterRepository: encounterRepository,
    });

    await assert.rejects(
      () => handler.execute(startCommand()),
      ClinicalEncounterNotOpenForClinicalEvolutionError,
    );
  });

  it('rejects patient mismatch against encounter', async () => {
    const encounterRepository = new InMemoryClinicalEncounterRepository();
    await seedOpenEncounter(encounterRepository);

    const handler = createHandler({
      tenantDirectory: seedTenant(),
      clinicalEncounterRepository: encounterRepository,
    });

    await assert.rejects(
      () => handler.execute(startCommand({ patientId: OTHER_PATIENT_ID })),
      ClinicalEncounterPatientMismatchForClinicalEvolutionError,
    );
  });

  it('rejects nutritionist mismatch against encounter', async () => {
    const encounterRepository = new InMemoryClinicalEncounterRepository();
    await seedOpenEncounter(encounterRepository);

    const handler = createHandler({
      tenantDirectory: seedTenant(),
      clinicalEncounterRepository: encounterRepository,
    });

    await assert.rejects(
      () =>
        handler.execute(
          startCommand({ responsibleNutritionistId: OTHER_NUTRITIONIST_ID }),
        ),
      ClinicalEncounterNutritionistMismatchForClinicalEvolutionError,
    );
  });

  it('rejects when clinical evolution already exists for encounter', async () => {
    const evolutionRepository = new InMemoryClinicalEvolutionRepository();
    await seedExistingEvolution(evolutionRepository);

    const encounterRepository = new InMemoryClinicalEncounterRepository();
    await seedOpenEncounter(encounterRepository);

    const handler = createHandler({
      clinicalEvolutionRepository: evolutionRepository,
      tenantDirectory: seedTenant(),
      clinicalEncounterRepository: encounterRepository,
    });

    await assert.rejects(
      () => handler.execute(startCommand()),
      ClinicalEvolutionAlreadyExistsForEncounterError,
    );
  });

  it('dispatches ClinicalEvolutionStarted after persistence', async () => {
    const eventDispatcher = new CapturingEventDispatcher();
    const evolutionRepository = new InMemoryClinicalEvolutionRepository();
    const encounterRepository = new InMemoryClinicalEncounterRepository();
    await seedOpenEncounter(encounterRepository);

    const handler = createHandler({
      clinicalEvolutionRepository: evolutionRepository,
      tenantDirectory: seedTenant(),
      clinicalEncounterRepository: encounterRepository,
      eventDispatcher,
    });

    const result = await handler.execute(startCommand());

    assert.equal(eventDispatcher.dispatched.length, 1);
    assert.equal(
      (eventDispatcher.dispatched[0]?.[0] as { eventName: string }).eventName,
      'ClinicalEvolutionStarted',
    );

    const stored = await evolutionRepository.findByTenantAndId(
      TENANT_ID,
      ClinicalEvolutionId.create(result.id),
    );
    assert.ok(stored);
  });
});
