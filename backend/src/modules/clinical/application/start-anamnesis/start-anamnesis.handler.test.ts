import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { CapturingEventDispatcher } from '../../../../test-support/capturing-event-dispatcher.js';
import { FixedClock } from '../../../../test-support/fixed-clock.js';
import { noopEventDispatcher } from '../../../../test-support/noop-event-dispatcher.js';
import { Anamnesis } from '../../domain/aggregates/anamnesis.aggregate.js';
import { AnamnesisId } from '../../domain/value-objects/anamnesis-id.js';
import { AnamnesisStatus } from '../../domain/value-objects/anamnesis-status.js';
import { InMemoryClinicalEncounterDirectory } from '../../infrastructure/adapters/in-memory-clinical-encounter-directory.js';
import { InMemoryTenantDirectory } from '../../infrastructure/adapters/in-memory-tenant-directory.js';
import { InMemoryAnamnesisRepository } from '../../infrastructure/repositories/in-memory-anamnesis.repository.js';
import { AnamnesisAlreadyExistsForEncounterError } from '../errors/anamnesis-already-exists-for-encounter.error.js';
import { ClinicalEncounterNotFoundForAnamnesisError } from '../errors/clinical-encounter-not-found-for-anamnesis.error.js';
import { ClinicalEncounterNotOpenForAnamnesisError } from '../errors/clinical-encounter-not-open-for-anamnesis.error.js';
import { ClinicalEncounterNutritionistMismatchError } from '../errors/clinical-encounter-nutritionist-mismatch.error.js';
import { ClinicalEncounterPatientMismatchError } from '../errors/clinical-encounter-patient-mismatch.error.js';
import { TenantInactiveForAnamnesisError } from '../errors/tenant-inactive-for-anamnesis.error.js';
import { TenantNotFoundForAnamnesisError } from '../errors/tenant-not-found-for-anamnesis.error.js';
import { StartAnamnesisCommand } from './start-anamnesis.command.js';
import { StartAnamnesisHandler } from './start-anamnesis.handler.js';

const NOW = new Date('2026-07-17T10:00:00.000Z');

const TENANT_ID = '550e8400-e29b-41d4-a716-446655440001';
const UNKNOWN_TENANT_ID = '550e8400-e29b-41d4-a716-446655440099';
const PATIENT_ID = '550e8400-e29b-41d4-a716-446655440020';
const OTHER_PATIENT_ID = '550e8400-e29b-41d4-a716-446655440021';
const NUTRITIONIST_ID = '550e8400-e29b-41d4-a716-446655440030';
const OTHER_NUTRITIONIST_ID = '550e8400-e29b-41d4-a716-446655440031';
const ENCOUNTER_ID = '550e8400-e29b-41d4-a716-446655440050';
const ANAMNESIS_ID = '550e8400-e29b-41d4-a716-446655440060';

function seedTenant(options?: { status?: 'ACTIVE' | 'INACTIVE' }) {
  const tenantDirectory = new InMemoryTenantDirectory();
  tenantDirectory.seed({
    id: TENANT_ID,
    status: options?.status ?? 'ACTIVE',
  });

  return tenantDirectory;
}

function seedEncounterDirectory(options?: {
  status?: 'OPEN' | 'FINISHED' | 'CANCELLED';
  patientId?: string;
  nutritionistId?: string;
}) {
  const clinicalEncounterDirectory = new InMemoryClinicalEncounterDirectory();
  clinicalEncounterDirectory.seed({
    id: ENCOUNTER_ID,
    tenantId: TENANT_ID,
    patientId: options?.patientId ?? PATIENT_ID,
    nutritionistId: options?.nutritionistId ?? NUTRITIONIST_ID,
    status: options?.status ?? 'OPEN',
  });

  return clinicalEncounterDirectory;
}

function createHandler(deps: {
  anamnesisRepository?: InMemoryAnamnesisRepository;
  tenantDirectory: InMemoryTenantDirectory;
  clinicalEncounterDirectory: InMemoryClinicalEncounterDirectory;
  eventDispatcher?: CapturingEventDispatcher;
}) {
  return new StartAnamnesisHandler(
    deps.anamnesisRepository ?? new InMemoryAnamnesisRepository(),
    deps.tenantDirectory,
    deps.clinicalEncounterDirectory,
    new FixedClock(NOW),
    deps.eventDispatcher ?? noopEventDispatcher,
  );
}

function startCommand(overrides?: {
  patientId?: string;
  nutritionistId?: string;
  clinicalEncounterId?: string;
}) {
  return new StartAnamnesisCommand({
    tenantId: TENANT_ID,
    clinicalEncounterId: overrides?.clinicalEncounterId ?? ENCOUNTER_ID,
    patientId: overrides?.patientId ?? PATIENT_ID,
    nutritionistId: overrides?.nutritionistId ?? NUTRITIONIST_ID,
  });
}

async function seedExistingAnamnesis(repository: InMemoryAnamnesisRepository) {
  const anamnesis = Anamnesis.create({
    id: AnamnesisId.create(ANAMNESIS_ID),
    tenantId: TENANT_ID,
    clinicalEncounterId: ENCOUNTER_ID,
    patientId: PATIENT_ID,
    nutritionistId: NUTRITIONIST_ID,
    now: NOW,
  });
  anamnesis.clearDomainEvents();
  await repository.save(anamnesis);
  return anamnesis;
}

describe('StartAnamnesisHandler', () => {
  it('starts anamnesis when tenant and encounter preconditions are met', async () => {
    const handler = createHandler({
      tenantDirectory: seedTenant(),
      clinicalEncounterDirectory: seedEncounterDirectory(),
    });

    const result = await handler.execute(startCommand());

    assert.equal(result.tenantId, TENANT_ID);
    assert.equal(result.clinicalEncounterId, ENCOUNTER_ID);
    assert.equal(result.patientId, PATIENT_ID);
    assert.equal(result.nutritionistId, NUTRITIONIST_ID);
    assert.equal(result.status, AnamnesisStatus.Draft);
    assert.equal(result.version, 1);
    assert.equal(result.chiefComplaint, null);
    assert.equal(result.completedAt, null);
    assert.equal(result.createdAt, NOW.toISOString());
    assert.equal(result.updatedAt, NOW.toISOString());
  });

  it('rejects unknown tenant', async () => {
    const handler = createHandler({
      tenantDirectory: new InMemoryTenantDirectory(),
      clinicalEncounterDirectory: seedEncounterDirectory(),
    });

    await assert.rejects(
      () =>
        handler.execute(
          new StartAnamnesisCommand({
            tenantId: UNKNOWN_TENANT_ID,
            clinicalEncounterId: ENCOUNTER_ID,
            patientId: PATIENT_ID,
            nutritionistId: NUTRITIONIST_ID,
          }),
        ),
      TenantNotFoundForAnamnesisError,
    );
  });

  it('rejects inactive tenant', async () => {
    const handler = createHandler({
      tenantDirectory: seedTenant({ status: 'INACTIVE' }),
      clinicalEncounterDirectory: seedEncounterDirectory(),
    });

    await assert.rejects(
      () => handler.execute(startCommand()),
      TenantInactiveForAnamnesisError,
    );
  });

  it('rejects when clinical encounter is not found', async () => {
    const handler = createHandler({
      tenantDirectory: seedTenant(),
      clinicalEncounterDirectory: new InMemoryClinicalEncounterDirectory(),
    });

    await assert.rejects(
      () => handler.execute(startCommand()),
      ClinicalEncounterNotFoundForAnamnesisError,
    );
  });

  it('rejects when clinical encounter is not OPEN', async () => {
    const handler = createHandler({
      tenantDirectory: seedTenant(),
      clinicalEncounterDirectory: seedEncounterDirectory({ status: 'FINISHED' }),
    });

    await assert.rejects(
      () => handler.execute(startCommand()),
      ClinicalEncounterNotOpenForAnamnesisError,
    );
  });

  it('rejects patient mismatch against encounter', async () => {
    const handler = createHandler({
      tenantDirectory: seedTenant(),
      clinicalEncounterDirectory: seedEncounterDirectory(),
    });

    await assert.rejects(
      () => handler.execute(startCommand({ patientId: OTHER_PATIENT_ID })),
      ClinicalEncounterPatientMismatchError,
    );
  });

  it('rejects nutritionist mismatch against encounter', async () => {
    const handler = createHandler({
      tenantDirectory: seedTenant(),
      clinicalEncounterDirectory: seedEncounterDirectory(),
    });

    await assert.rejects(
      () =>
        handler.execute(startCommand({ nutritionistId: OTHER_NUTRITIONIST_ID })),
      ClinicalEncounterNutritionistMismatchError,
    );
  });

  it('rejects when anamnesis already exists for encounter', async () => {
    const anamnesisRepository = new InMemoryAnamnesisRepository();
    await seedExistingAnamnesis(anamnesisRepository);

    const handler = createHandler({
      anamnesisRepository,
      tenantDirectory: seedTenant(),
      clinicalEncounterDirectory: seedEncounterDirectory(),
    });

    await assert.rejects(
      () => handler.execute(startCommand()),
      AnamnesisAlreadyExistsForEncounterError,
    );
  });

  it('dispatches AnamnesisStarted after persistence', async () => {
    const eventDispatcher = new CapturingEventDispatcher();
    const anamnesisRepository = new InMemoryAnamnesisRepository();
    const handler = createHandler({
      anamnesisRepository,
      tenantDirectory: seedTenant(),
      clinicalEncounterDirectory: seedEncounterDirectory(),
      eventDispatcher,
    });

    const result = await handler.execute(startCommand());

    assert.equal(eventDispatcher.dispatched.length, 1);
    assert.equal(
      (eventDispatcher.dispatched[0]?.[0] as { eventName: string }).eventName,
      'AnamnesisStarted',
    );

    const stored = await anamnesisRepository.findByTenantAndId(
      TENANT_ID,
      AnamnesisId.create(result.id),
    );
    assert.ok(stored);
  });

  it('does not dispatch events when persistence fails', async () => {
    const eventDispatcher = new CapturingEventDispatcher();
    const failingRepository = new InMemoryAnamnesisRepository();
    failingRepository.save = async () => {
      throw new Error('persistence failed');
    };

    const handler = createHandler({
      anamnesisRepository: failingRepository,
      tenantDirectory: seedTenant(),
      clinicalEncounterDirectory: seedEncounterDirectory(),
      eventDispatcher,
    });

    await assert.rejects(
      () => handler.execute(startCommand()),
      /persistence failed/,
    );
    assert.equal(eventDispatcher.dispatched.length, 0);
  });

  it('persists anamnesis before dispatching events', async () => {
    const eventDispatcher = new CapturingEventDispatcher();
    const anamnesisRepository = new InMemoryAnamnesisRepository();
    let savedBeforeDispatch = false;

    const originalSave = anamnesisRepository.save.bind(anamnesisRepository);
    anamnesisRepository.save = async (anamnesis) => {
      await originalSave(anamnesis);
      savedBeforeDispatch = eventDispatcher.dispatched.length === 0;
    };

    const handler = createHandler({
      anamnesisRepository,
      tenantDirectory: seedTenant(),
      clinicalEncounterDirectory: seedEncounterDirectory(),
      eventDispatcher,
    });

    await handler.execute(startCommand());

    assert.equal(savedBeforeDispatch, true);
  });
});
