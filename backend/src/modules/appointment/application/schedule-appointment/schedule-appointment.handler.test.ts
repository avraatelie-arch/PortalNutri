import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { CapturingEventDispatcher } from '../../../../test-support/capturing-event-dispatcher.js';
import { FixedClock } from '../../../../test-support/fixed-clock.js';
import { noopEventDispatcher } from '../../../../test-support/noop-event-dispatcher.js';
import { AppointmentId } from '../../domain/value-objects/appointment-id.js';
import { AppointmentModeValue } from '../../domain/value-objects/appointment-mode.js';
import { AppointmentStatus } from '../../domain/value-objects/appointment-status.js';
import { InMemoryNutritionistDirectory } from '../../infrastructure/adapters/in-memory-nutritionist-directory.js';
import { InMemoryPatientDirectory } from '../../infrastructure/adapters/in-memory-patient-directory.js';
import { InMemoryPatientNutritionistAssignmentDirectory } from '../../infrastructure/adapters/in-memory-patient-nutritionist-assignment-directory.js';
import { InMemoryTenantDirectory } from '../../infrastructure/adapters/in-memory-tenant-directory.js';
import { InMemoryAppointmentRepository } from '../../infrastructure/repositories/in-memory-appointment.repository.js';
import { AppointmentConflictError } from '../errors/appointment-conflict.error.js';
import { PatientNutritionistAssignmentRequiredError } from '../errors/patient-nutritionist-assignment-required.error.js';
import { ScheduleAppointmentCommand } from './schedule-appointment.command.js';
import { ScheduleAppointmentHandler } from './schedule-appointment.handler.js';

const NOW = new Date('2026-07-17T10:00:00.000Z');
const FUTURE_START = '2026-07-18T14:00:00.000Z';
const FUTURE_END_15 = '2026-07-18T14:15:00.000Z';
const FUTURE_END_30 = '2026-07-18T14:30:00.000Z';

const TENANT_ID = '550e8400-e29b-41d4-a716-446655440001';
const PATIENT_ID = '550e8400-e29b-41d4-a716-446655440020';
const NUTRITIONIST_ID = '550e8400-e29b-41d4-a716-446655440030';
const OTHER_PATIENT_ID = '550e8400-e29b-41d4-a716-446655440021';

function seedDirectories(options?: { withAssignment?: boolean }) {
  const tenantDirectory = new InMemoryTenantDirectory();
  tenantDirectory.seed({ id: TENANT_ID, status: 'ACTIVE' });

  const patientDirectory = new InMemoryPatientDirectory();
  patientDirectory.seed({ id: PATIENT_ID, tenantId: TENANT_ID, status: 'ACTIVE' });
  patientDirectory.seed({
    id: OTHER_PATIENT_ID,
    tenantId: TENANT_ID,
    status: 'ACTIVE',
  });

  const nutritionistDirectory = new InMemoryNutritionistDirectory();
  nutritionistDirectory.seed({
    id: NUTRITIONIST_ID,
    tenantId: TENANT_ID,
    status: 'ACTIVE',
  });

  const assignmentDirectory = new InMemoryPatientNutritionistAssignmentDirectory();
  if (options?.withAssignment !== false) {
    assignmentDirectory.seed(TENANT_ID, PATIENT_ID, NUTRITIONIST_ID);
    assignmentDirectory.seed(TENANT_ID, OTHER_PATIENT_ID, NUTRITIONIST_ID);
  }

  return {
    tenantDirectory,
    patientDirectory,
    nutritionistDirectory,
    assignmentDirectory,
  };
}

function createHandler(deps: {
  appointmentRepository?: InMemoryAppointmentRepository;
  tenantDirectory: InMemoryTenantDirectory;
  patientDirectory: InMemoryPatientDirectory;
  nutritionistDirectory: InMemoryNutritionistDirectory;
  assignmentDirectory: InMemoryPatientNutritionistAssignmentDirectory;
  eventDispatcher?: CapturingEventDispatcher;
}) {
  return new ScheduleAppointmentHandler(
    deps.appointmentRepository ?? new InMemoryAppointmentRepository(),
    deps.tenantDirectory,
    deps.patientDirectory,
    deps.nutritionistDirectory,
    deps.assignmentDirectory,
    new FixedClock(NOW),
    deps.eventDispatcher ?? noopEventDispatcher,
  );
}

function scheduleCommand(overrides?: {
  patientId?: string;
  nutritionistId?: string;
  startsAt?: string;
  endsAt?: string;
}) {
  return new ScheduleAppointmentCommand({
    tenantId: TENANT_ID,
    patientId: overrides?.patientId ?? PATIENT_ID,
    nutritionistId: overrides?.nutritionistId ?? NUTRITIONIST_ID,
    startsAt: overrides?.startsAt ?? FUTURE_START,
    endsAt: overrides?.endsAt ?? FUTURE_END_15,
    mode: AppointmentModeValue.InPerson,
    notes: 'Initial consultation',
  });
}

describe('ScheduleAppointmentHandler', () => {
  it('schedules an appointment when preconditions are met', async () => {
    const directories = seedDirectories();
    const handler = createHandler(directories);

    const result = await handler.execute(scheduleCommand());

    assert.equal(result.tenantId, TENANT_ID);
    assert.equal(result.patientId, PATIENT_ID);
    assert.equal(result.nutritionistId, NUTRITIONIST_ID);
    assert.equal(result.startsAt, FUTURE_START);
    assert.equal(result.endsAt, FUTURE_END_15);
    assert.equal(result.mode, AppointmentModeValue.InPerson);
    assert.equal(result.status, AppointmentStatus.Scheduled);
    assert.equal(result.notes, 'Initial consultation');
  });

  it('dispatches AppointmentScheduled after persistence', async () => {
    const directories = seedDirectories();
    const eventDispatcher = new CapturingEventDispatcher();
    const handler = createHandler({ ...directories, eventDispatcher });

    await handler.execute(scheduleCommand());

    assert.equal(eventDispatcher.dispatched.length, 1);
    assert.equal(
      (eventDispatcher.dispatched[0]?.[0] as { eventName: string }).eventName,
      'AppointmentScheduled',
    );
  });

  it('rejects scheduling without active patient-nutritionist assignment', async () => {
    const directories = seedDirectories({ withAssignment: false });
    const handler = createHandler(directories);

    await assert.rejects(
      () => handler.execute(scheduleCommand()),
      PatientNutritionistAssignmentRequiredError,
    );
  });

  it('rejects nutritionist scheduling conflict', async () => {
    const directories = seedDirectories();
    const appointmentRepository = new InMemoryAppointmentRepository();
    const handler = createHandler({ ...directories, appointmentRepository });

    await handler.execute(scheduleCommand({ patientId: PATIENT_ID }));

    await assert.rejects(
      () =>
        handler.execute(
          scheduleCommand({
            patientId: OTHER_PATIENT_ID,
            startsAt: FUTURE_START,
            endsAt: FUTURE_END_15,
          }),
        ),
      AppointmentConflictError,
    );
  });

  it('rejects patient scheduling conflict', async () => {
    const directories = seedDirectories();
    assignmentDirectorySeedSecondNutritionist(directories.assignmentDirectory);
    directories.nutritionistDirectory.seed({
      id: '550e8400-e29b-41d4-a716-446655440031',
      tenantId: TENANT_ID,
      status: 'ACTIVE',
    });

    const appointmentRepository = new InMemoryAppointmentRepository();
    const handler = createHandler({ ...directories, appointmentRepository });

    await handler.execute(scheduleCommand());

    await assert.rejects(
      () =>
        handler.execute(
          scheduleCommand({
            nutritionistId: '550e8400-e29b-41d4-a716-446655440031',
            startsAt: '2026-07-18T14:10:00.000Z',
            endsAt: FUTURE_END_30,
          }),
        ),
      AppointmentConflictError,
    );
  });

  it('allows adjacent appointments without overlap', async () => {
    const directories = seedDirectories();
    assignmentDirectorySeedSecondNutritionist(directories.assignmentDirectory);
    directories.nutritionistDirectory.seed({
      id: '550e8400-e29b-41d4-a716-446655440031',
      tenantId: TENANT_ID,
      status: 'ACTIVE',
    });

    const appointmentRepository = new InMemoryAppointmentRepository();
    const handler = createHandler({ ...directories, appointmentRepository });

    await handler.execute(scheduleCommand());

    const adjacent = await handler.execute(
      scheduleCommand({
        nutritionistId: '550e8400-e29b-41d4-a716-446655440031',
        startsAt: FUTURE_END_15,
        endsAt: FUTURE_END_30,
      }),
    );

    assert.equal(adjacent.startsAt, FUTURE_END_15);
  });

  it('does not dispatch events when persistence fails', async () => {
    const directories = seedDirectories();
    const eventDispatcher = new CapturingEventDispatcher();
    const failingRepository = new InMemoryAppointmentRepository();
    failingRepository.save = async () => {
      throw new Error('persistence failed');
    };

    const handler = createHandler({
      ...directories,
      appointmentRepository: failingRepository,
      eventDispatcher,
    });

    await assert.rejects(
      () => handler.execute(scheduleCommand()),
      /persistence failed/,
    );
    assert.equal(eventDispatcher.dispatched.length, 0);
  });

  it('persists appointment before dispatching events', async () => {
    const directories = seedDirectories();
    const appointmentRepository = new InMemoryAppointmentRepository();
    const eventDispatcher = new CapturingEventDispatcher();
    let savedBeforeDispatch = false;

    const originalSave = appointmentRepository.save.bind(appointmentRepository);
    appointmentRepository.save = async (appointment) => {
      await originalSave(appointment);
      savedBeforeDispatch = eventDispatcher.dispatched.length === 0;
    };

    const handler = createHandler({
      ...directories,
      appointmentRepository,
      eventDispatcher,
    });

    const result = await handler.execute(scheduleCommand());

    assert.equal(savedBeforeDispatch, true);
    const stored = await appointmentRepository.findById(
      AppointmentId.create(result.id),
    );
    assert.ok(stored);
    assert.equal(result.id, stored.getId().toString());
  });
});

function assignmentDirectorySeedSecondNutritionist(
  assignmentDirectory: InMemoryPatientNutritionistAssignmentDirectory,
) {
  assignmentDirectory.seed(
    TENANT_ID,
    PATIENT_ID,
    '550e8400-e29b-41d4-a716-446655440031',
  );
}
