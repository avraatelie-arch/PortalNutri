import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { CapturingEventDispatcher } from '../../../../test-support/capturing-event-dispatcher.js';
import { FixedClock } from '../../../../test-support/fixed-clock.js';
import { noopEventDispatcher } from '../../../../test-support/noop-event-dispatcher.js';
import { ClinicalEncounter } from '../../domain/aggregates/clinical-encounter.aggregate.js';
import { ClinicalEncounterStatus } from '../../domain/value-objects/clinical-encounter-status.js';
import {
  ClinicalEncounterType,
  ClinicalEncounterTypeValue,
} from '../../domain/value-objects/clinical-encounter-type.js';
import { ClinicalEncounterId } from '../../domain/value-objects/clinical-encounter-id.js';
import { ClinicalNotes } from '../../domain/value-objects/clinical-notes.js';
import { InMemoryAppointmentDirectory } from '../../infrastructure/adapters/in-memory-appointment-directory.js';
import { InMemoryNutritionistDirectory } from '../../infrastructure/adapters/in-memory-nutritionist-directory.js';
import { InMemoryPatientDirectory } from '../../infrastructure/adapters/in-memory-patient-directory.js';
import { InMemoryTenantDirectory } from '../../infrastructure/adapters/in-memory-tenant-directory.js';
import { InMemoryClinicalEncounterRepository } from '../../infrastructure/repositories/in-memory-clinical-encounter.repository.js';
import { AppointmentNotCompletedError } from '../errors/appointment-not-completed.error.js';
import { ClinicalEncounterAlreadyExistsForAppointmentError } from '../errors/clinical-encounter-already-exists-for-appointment.error.js';
import { ClinicalEncounterAlreadyOpenError } from '../errors/clinical-encounter-already-open.error.js';
import { NutritionistInactiveForEncounterError } from '../errors/nutritionist-inactive-for-encounter.error.js';
import { PatientInactiveForEncounterError } from '../errors/patient-inactive-for-encounter.error.js';
import { TenantInactiveForEncounterError } from '../errors/tenant-inactive-for-encounter.error.js';
import { TenantNotFoundForEncounterError } from '../errors/tenant-not-found-for-encounter.error.js';
import { StartClinicalEncounterCommand } from './start-clinical-encounter.command.js';
import { StartClinicalEncounterHandler } from './start-clinical-encounter.handler.js';

const NOW = new Date('2026-07-17T10:00:00.000Z');

const TENANT_ID = '550e8400-e29b-41d4-a716-446655440001';
const UNKNOWN_TENANT_ID = '550e8400-e29b-41d4-a716-446655440099';
const PATIENT_ID = '550e8400-e29b-41d4-a716-446655440020';
const NUTRITIONIST_ID = '550e8400-e29b-41d4-a716-446655440030';
const APPOINTMENT_ID = '550e8400-e29b-41d4-a716-446655440040';
const EXISTING_ENCOUNTER_ID = '550e8400-e29b-41d4-a716-446655440050';

function seedDirectories(options?: {
  tenantStatus?: 'ACTIVE' | 'INACTIVE';
  patientStatus?: 'ACTIVE' | 'INACTIVE';
  nutritionistStatus?: 'ACTIVE' | 'INACTIVE';
}) {
  const tenantDirectory = new InMemoryTenantDirectory();
  tenantDirectory.seed({
    id: TENANT_ID,
    status: options?.tenantStatus ?? 'ACTIVE',
  });

  const patientDirectory = new InMemoryPatientDirectory();
  patientDirectory.seed({
    id: PATIENT_ID,
    tenantId: TENANT_ID,
    status: options?.patientStatus ?? 'ACTIVE',
  });

  const nutritionistDirectory = new InMemoryNutritionistDirectory();
  nutritionistDirectory.seed({
    id: NUTRITIONIST_ID,
    tenantId: TENANT_ID,
    status: options?.nutritionistStatus ?? 'ACTIVE',
  });

  const appointmentDirectory = new InMemoryAppointmentDirectory();

  return {
    tenantDirectory,
    patientDirectory,
    nutritionistDirectory,
    appointmentDirectory,
  };
}

function createHandler(deps: {
  encounterRepository?: InMemoryClinicalEncounterRepository;
  tenantDirectory: InMemoryTenantDirectory;
  patientDirectory: InMemoryPatientDirectory;
  nutritionistDirectory: InMemoryNutritionistDirectory;
  appointmentDirectory: InMemoryAppointmentDirectory;
  eventDispatcher?: CapturingEventDispatcher;
}) {
  return new StartClinicalEncounterHandler(
    deps.encounterRepository ?? new InMemoryClinicalEncounterRepository(),
    deps.tenantDirectory,
    deps.patientDirectory,
    deps.nutritionistDirectory,
    deps.appointmentDirectory,
    new FixedClock(NOW),
    deps.eventDispatcher ?? noopEventDispatcher,
  );
}

function startCommand(overrides?: {
  appointmentId?: string | null;
  notes?: string | null;
}) {
  return new StartClinicalEncounterCommand({
    tenantId: TENANT_ID,
    patientId: PATIENT_ID,
    nutritionistId: NUTRITIONIST_ID,
    type: ClinicalEncounterTypeValue.Initial,
    appointmentId: overrides?.appointmentId,
    notes: overrides?.notes,
  });
}

async function seedExistingEncounter(params: {
  repository: InMemoryClinicalEncounterRepository;
  status: ClinicalEncounterStatus;
  appointmentId?: string | null;
  id?: string;
}) {
  const encounter = ClinicalEncounter.reconstitute({
    id: ClinicalEncounterId.create(params.id ?? EXISTING_ENCOUNTER_ID),
    tenantId: TENANT_ID,
    appointmentId: params.appointmentId ?? null,
    patientId: PATIENT_ID,
    nutritionistId: NUTRITIONIST_ID,
    type: ClinicalEncounterType.create(ClinicalEncounterTypeValue.FollowUp),
    status: params.status,
    notes: ClinicalNotes.create(null),
    startedAt: NOW,
    finishedAt:
      params.status === ClinicalEncounterStatus.Finished ? NOW : null,
    createdAt: NOW,
    updatedAt: NOW,
  });

  await params.repository.save(encounter);
  return encounter;
}

describe('StartClinicalEncounterHandler', () => {
  it('starts an encounter without appointment when preconditions are met', async () => {
    const directories = seedDirectories();
    const handler = createHandler(directories);

    const result = await handler.execute(startCommand());

    assert.equal(result.tenantId, TENANT_ID);
    assert.equal(result.patientId, PATIENT_ID);
    assert.equal(result.nutritionistId, NUTRITIONIST_ID);
    assert.equal(result.appointmentId, null);
    assert.equal(result.type, ClinicalEncounterTypeValue.Initial);
    assert.equal(result.status, ClinicalEncounterStatus.Open);
    assert.equal(result.startedAt, NOW.toISOString());
    assert.equal(result.finishedAt, null);
  });

  it('starts an encounter linked to a completed appointment', async () => {
    const directories = seedDirectories();
    directories.appointmentDirectory.seed({
      id: APPOINTMENT_ID,
      tenantId: TENANT_ID,
      patientId: PATIENT_ID,
      nutritionistId: NUTRITIONIST_ID,
      status: 'COMPLETED',
    });

    const handler = createHandler(directories);
    const result = await handler.execute(
      startCommand({ appointmentId: APPOINTMENT_ID, notes: 'Initial notes' }),
    );

    assert.equal(result.appointmentId, APPOINTMENT_ID);
    assert.equal(result.notes, 'Initial notes');
    assert.equal(result.status, ClinicalEncounterStatus.Open);
  });

  it('rejects inactive tenant', async () => {
    const directories = seedDirectories({ tenantStatus: 'INACTIVE' });
    const handler = createHandler(directories);

    await assert.rejects(
      () => handler.execute(startCommand()),
      TenantInactiveForEncounterError,
    );
  });

  it('rejects inactive patient', async () => {
    const directories = seedDirectories({ patientStatus: 'INACTIVE' });
    const handler = createHandler(directories);

    await assert.rejects(
      () => handler.execute(startCommand()),
      PatientInactiveForEncounterError,
    );
  });

  it('rejects inactive nutritionist', async () => {
    const directories = seedDirectories({ nutritionistStatus: 'INACTIVE' });
    const handler = createHandler(directories);

    await assert.rejects(
      () => handler.execute(startCommand()),
      NutritionistInactiveForEncounterError,
    );
  });

  it('rejects appointment that is not completed', async () => {
    const directories = seedDirectories();
    directories.appointmentDirectory.seed({
      id: APPOINTMENT_ID,
      tenantId: TENANT_ID,
      patientId: PATIENT_ID,
      nutritionistId: NUTRITIONIST_ID,
      status: 'CONFIRMED',
    });

    const handler = createHandler(directories);

    await assert.rejects(
      () => handler.execute(startCommand({ appointmentId: APPOINTMENT_ID })),
      AppointmentNotCompletedError,
    );
  });

  it('rejects when an open encounter already exists for patient and nutritionist', async () => {
    const directories = seedDirectories();
    const encounterRepository = new InMemoryClinicalEncounterRepository();
    await seedExistingEncounter({
      repository: encounterRepository,
      status: ClinicalEncounterStatus.Open,
    });

    const handler = createHandler({ ...directories, encounterRepository });

    await assert.rejects(
      () => handler.execute(startCommand()),
      ClinicalEncounterAlreadyOpenError,
    );
  });

  it('rejects when an encounter already exists for appointment in OPEN status', async () => {
    const directories = seedDirectories();
    directories.appointmentDirectory.seed({
      id: APPOINTMENT_ID,
      tenantId: TENANT_ID,
      patientId: PATIENT_ID,
      nutritionistId: NUTRITIONIST_ID,
      status: 'COMPLETED',
    });

    const encounterRepository = new InMemoryClinicalEncounterRepository();
    await seedExistingEncounter({
      repository: encounterRepository,
      status: ClinicalEncounterStatus.Open,
      appointmentId: APPOINTMENT_ID,
    });

    const handler = createHandler({ ...directories, encounterRepository });

    await assert.rejects(
      () => handler.execute(startCommand({ appointmentId: APPOINTMENT_ID })),
      ClinicalEncounterAlreadyExistsForAppointmentError,
    );
  });

  it('rejects when an encounter already exists for appointment in FINISHED status', async () => {
    const directories = seedDirectories();
    directories.appointmentDirectory.seed({
      id: APPOINTMENT_ID,
      tenantId: TENANT_ID,
      patientId: PATIENT_ID,
      nutritionistId: NUTRITIONIST_ID,
      status: 'COMPLETED',
    });

    const encounterRepository = new InMemoryClinicalEncounterRepository();
    await seedExistingEncounter({
      repository: encounterRepository,
      status: ClinicalEncounterStatus.Finished,
      appointmentId: APPOINTMENT_ID,
    });

    const handler = createHandler({ ...directories, encounterRepository });

    await assert.rejects(
      () => handler.execute(startCommand({ appointmentId: APPOINTMENT_ID })),
      ClinicalEncounterAlreadyExistsForAppointmentError,
    );
  });

  it('rejects when an encounter already exists for appointment in CANCELLED status', async () => {
    const directories = seedDirectories();
    directories.appointmentDirectory.seed({
      id: APPOINTMENT_ID,
      tenantId: TENANT_ID,
      patientId: PATIENT_ID,
      nutritionistId: NUTRITIONIST_ID,
      status: 'COMPLETED',
    });

    const encounterRepository = new InMemoryClinicalEncounterRepository();
    await seedExistingEncounter({
      repository: encounterRepository,
      status: ClinicalEncounterStatus.Cancelled,
      appointmentId: APPOINTMENT_ID,
    });

    const handler = createHandler({ ...directories, encounterRepository });

    await assert.rejects(
      () => handler.execute(startCommand({ appointmentId: APPOINTMENT_ID })),
      ClinicalEncounterAlreadyExistsForAppointmentError,
    );
  });

  it('does not accept startedAt in command request', () => {
    const command = startCommand();

    assert.doesNotMatch(
      JSON.stringify(Object.keys(command.request)),
      /startedAt/,
    );
    assert.equal('startedAt' in command.request, false);
  });

  it('uses clock for startedAt instead of client input', async () => {
    const directories = seedDirectories();
    const handler = createHandler(directories);

    const result = await handler.execute(startCommand());

    assert.equal(result.startedAt, NOW.toISOString());
  });

  it('dispatches ClinicalEncounterStarted after persistence', async () => {
    const directories = seedDirectories();
    const eventDispatcher = new CapturingEventDispatcher();
    const handler = createHandler({ ...directories, eventDispatcher });

    await handler.execute(startCommand());

    assert.equal(eventDispatcher.dispatched.length, 1);
    assert.equal(
      (eventDispatcher.dispatched[0]?.[0] as { eventName: string }).eventName,
      'ClinicalEncounterStarted',
    );
  });

  it('does not dispatch events when persistence fails', async () => {
    const directories = seedDirectories();
    const eventDispatcher = new CapturingEventDispatcher();
    const failingRepository = new InMemoryClinicalEncounterRepository();
    failingRepository.save = async () => {
      throw new Error('persistence failed');
    };

    const handler = createHandler({
      ...directories,
      encounterRepository: failingRepository,
      eventDispatcher,
    });

    await assert.rejects(
      () => handler.execute(startCommand()),
      /persistence failed/,
    );
    assert.equal(eventDispatcher.dispatched.length, 0);
  });

  it('validates tenant via directory instead of tenant-scoped repository find on start', async () => {
    const directories = seedDirectories();
    const handler = createHandler(directories);

    await assert.rejects(
      () =>
        handler.execute(
          new StartClinicalEncounterCommand({
            tenantId: UNKNOWN_TENANT_ID,
            patientId: PATIENT_ID,
            nutritionistId: NUTRITIONIST_ID,
            type: ClinicalEncounterTypeValue.Initial,
          }),
        ),
      TenantNotFoundForEncounterError,
    );
  });

  it('persists encounter before dispatching events', async () => {
    const directories = seedDirectories();
    const encounterRepository = new InMemoryClinicalEncounterRepository();
    const eventDispatcher = new CapturingEventDispatcher();
    let savedBeforeDispatch = false;

    const originalSave = encounterRepository.save.bind(encounterRepository);
    encounterRepository.save = async (encounter) => {
      await originalSave(encounter);
      savedBeforeDispatch = eventDispatcher.dispatched.length === 0;
    };

    const handler = createHandler({
      ...directories,
      encounterRepository,
      eventDispatcher,
    });

    const result = await handler.execute(startCommand());

    assert.equal(savedBeforeDispatch, true);
    const stored = await encounterRepository.findByTenantAndId(
      TENANT_ID,
      ClinicalEncounterId.create(result.id),
    );
    assert.ok(stored);
    assert.equal(result.id, stored.getId().toString());
  });
});
