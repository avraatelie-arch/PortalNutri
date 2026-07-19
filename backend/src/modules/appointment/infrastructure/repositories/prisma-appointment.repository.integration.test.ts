import assert from 'node:assert/strict';
import { after, before, beforeEach, describe, it } from 'node:test';
import { PrismaClient } from '@prisma/client';
import { requireDatabaseUrl } from '../../../../config/test-env.js';
import { FixedClock } from '../../../../test-support/fixed-clock.js';
import { noopEventDispatcher } from '../../../../test-support/noop-event-dispatcher.js';
import { AddPersonToTenantCommand } from '../../../iam/application/add-person-to-tenant/add-person-to-tenant.command.js';
import { AddPersonToTenantHandler } from '../../../iam/application/add-person-to-tenant/add-person-to-tenant.handler.js';
import { CreatePersonCommand } from '../../../iam/application/create-person/create-person.command.js';
import { CreatePersonHandler } from '../../../iam/application/create-person/create-person.handler.js';
import { CreateTenantCommand } from '../../../iam/application/create-tenant/create-tenant.command.js';
import { CreateTenantHandler } from '../../../iam/application/create-tenant/create-tenant.handler.js';
import { DocumentType } from '../../../iam/domain/value-objects/document.js';
import { PrismaMembershipRepository } from '../../../iam/infrastructure/repositories/prisma-membership.repository.js';
import { PrismaPersonRepository } from '../../../iam/infrastructure/repositories/prisma-person.repository.js';
import { PrismaTenantRepository } from '../../../iam/infrastructure/repositories/prisma-tenant.repository.js';
import { CreateNutritionistCommand } from '../../../nutrition/application/create-nutritionist/create-nutritionist.command.js';
import { CreateNutritionistHandler } from '../../../nutrition/application/create-nutritionist/create-nutritionist.handler.js';
import { PrismaNutritionistRepository } from '../../../nutrition/infrastructure/repositories/prisma-nutritionist.repository.js';
import { AssignNutritionistToPatientCommand } from '../../../patient/application/assign-nutritionist-to-patient/assign-nutritionist-to-patient.command.js';
import { AssignNutritionistToPatientHandler } from '../../../patient/application/assign-nutritionist-to-patient/assign-nutritionist-to-patient.handler.js';
import { CreatePatientCommand } from '../../../patient/application/create-patient/create-patient.command.js';
import { CreatePatientHandler } from '../../../patient/application/create-patient/create-patient.handler.js';
import { PatientNutritionistAssignmentRoleValue } from '../../../patient/domain/value-objects/patient-nutritionist-assignment-role.js';
import { PrismaNutritionistDirectoryAdapter } from '../../../patient/infrastructure/adapters/prisma-nutritionist-directory.adapter.js';
import { PrismaPatientRepository } from '../../../patient/infrastructure/repositories/prisma-patient.repository.js';
import { PrismaPatientNutritionistAssignmentRepository } from '../../../patient/infrastructure/repositories/prisma-patient-nutritionist-assignment.repository.js';
import { AppointmentId } from '../../domain/value-objects/appointment-id.js';
import { AppointmentModeValue } from '../../domain/value-objects/appointment-mode.js';
import { AppointmentStatus } from '../../domain/value-objects/appointment-status.js';
import { ConfirmAppointmentCommand } from '../../application/confirm-appointment/confirm-appointment.command.js';
import { ConfirmAppointmentHandler } from '../../application/confirm-appointment/confirm-appointment.handler.js';
import { FindAppointmentQuery } from '../../application/find-appointment/find-appointment.query.js';
import { FindAppointmentHandler } from '../../application/find-appointment/find-appointment.handler.js';
import { ScheduleAppointmentCommand } from '../../application/schedule-appointment/schedule-appointment.command.js';
import { ScheduleAppointmentHandler } from '../../application/schedule-appointment/schedule-appointment.handler.js';
import { PrismaNutritionistDirectoryAdapter as AppointmentNutritionistDirectoryAdapter } from '../adapters/prisma-nutritionist-directory.adapter.js';
import { PrismaPatientDirectoryAdapter } from '../adapters/prisma-patient-directory.adapter.js';
import { PrismaPatientNutritionistAssignmentDirectoryAdapter } from '../adapters/prisma-patient-nutritionist-assignment-directory.adapter.js';
import { PrismaTenantDirectoryAdapter } from '../adapters/prisma-tenant-directory.adapter.js';
import { PrismaAppointmentRepository } from './prisma-appointment.repository.js';

requireDatabaseUrl();

const NOW = new Date('2026-07-17T10:00:00.000Z');
const FUTURE_START = '2026-07-18T14:00:00.000Z';
const FUTURE_END_15 = '2026-07-18T14:15:00.000Z';
const FUTURE_END_30 = '2026-07-18T14:30:00.000Z';

const prisma = new PrismaClient();
const appointmentRepository = new PrismaAppointmentRepository(prisma);
const tenantRepository = new PrismaTenantRepository(prisma);
const personRepository = new PrismaPersonRepository(prisma);
const membershipRepository = new PrismaMembershipRepository(prisma);
const nutritionistRepository = new PrismaNutritionistRepository(prisma);
const patientRepository = new PrismaPatientRepository(prisma);
const assignmentRepository = new PrismaPatientNutritionistAssignmentRepository(prisma);
const tenantDirectory = new PrismaTenantDirectoryAdapter(prisma);
const patientDirectory = new PrismaPatientDirectoryAdapter(prisma);
const nutritionistDirectory = new AppointmentNutritionistDirectoryAdapter(prisma);
const assignmentDirectory = new PrismaPatientNutritionistAssignmentDirectoryAdapter(prisma);
const patientNutritionistDirectory = new PrismaNutritionistDirectoryAdapter(prisma);
const clock = new FixedClock(NOW);

async function resetAppointments() {
  await prisma.appointment.deleteMany();
  await prisma.patientNutritionistAssignment.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.nutritionist.deleteMany();
  await prisma.permissionAssignment.deleteMany();
  await prisma.permission.deleteMany();
  await prisma.roleAssignment.deleteMany();
  await prisma.role.deleteMany();
  await prisma.membership.deleteMany();
  await prisma.session.deleteMany();
  await prisma.credential.deleteMany();
  await prisma.person.deleteMany();
  await prisma.tenant.deleteMany();
}

async function createFixture() {
  const person = await new CreatePersonHandler(
    personRepository,
    noopEventDispatcher,
  ).execute(
    new CreatePersonCommand({
      fullName: 'Ana Nutricionista',
      email: 'ana.appointment@example.com',
      documentType: DocumentType.PASSPORT,
      document: 'AP123456',
      birthDate: '1988-03-20',
    }),
  );

  const tenant = await new CreateTenantHandler(
    tenantRepository,
    noopEventDispatcher,
  ).execute(
    new CreateTenantCommand({
      name: 'Appointment Clinic',
      slug: 'appointment-clinic',
    }),
  );

  await new AddPersonToTenantHandler(
    membershipRepository,
    personRepository,
    tenantRepository,
    noopEventDispatcher,
  ).execute(
    new AddPersonToTenantCommand({
      personId: person.id,
      tenantId: tenant.id,
    }),
  );

  const nutritionist = await new CreateNutritionistHandler(
    nutritionistRepository,
    personRepository,
    tenantRepository,
    membershipRepository,
    noopEventDispatcher,
  ).execute(
    new CreateNutritionistCommand({
      personId: person.id,
      tenantId: tenant.id,
      crn: '65432',
      stateCode: 'SP',
      specialty: 'Clinical Nutrition',
    }),
  );

  const patient = await new CreatePatientHandler(
    patientRepository,
    tenantRepository,
    noopEventDispatcher,
  ).execute(
    new CreatePatientCommand({
      tenantId: tenant.id,
      fullName: 'Carlos Paciente',
      birthDate: '1992-07-10',
      gender: 'MALE',
    }),
  );

  await new AssignNutritionistToPatientHandler(
    assignmentRepository,
    patientRepository,
    patientNutritionistDirectory,
    tenantRepository,
    noopEventDispatcher,
  ).execute(
    new AssignNutritionistToPatientCommand({
      tenantId: tenant.id,
      patientId: patient.id,
      nutritionistId: nutritionist.id,
      role: PatientNutritionistAssignmentRoleValue.Primary,
    }),
  );

  return { tenant, patient, nutritionist };
}

function createScheduleHandler() {
  return new ScheduleAppointmentHandler(
    appointmentRepository,
    tenantDirectory,
    patientDirectory,
    nutritionistDirectory,
    assignmentDirectory,
    clock,
    noopEventDispatcher,
  );
}

describe('PrismaAppointmentRepository (integration)', () => {
  before(async () => {
    await resetAppointments();
  });

  beforeEach(async () => {
    await resetAppointments();
  });

  after(async () => {
    await resetAppointments();
    await prisma.$disconnect();
  });

  it('persists and finds an appointment by tenant and id', async () => {
    const { tenant, patient, nutritionist } = await createFixture();
    const scheduleHandler = createScheduleHandler();
    const findHandler = new FindAppointmentHandler(appointmentRepository);

    const scheduled = await scheduleHandler.execute(
      new ScheduleAppointmentCommand({
        tenantId: tenant.id,
        patientId: patient.id,
        nutritionistId: nutritionist.id,
        startsAt: FUTURE_START,
        endsAt: FUTURE_END_15,
        mode: AppointmentModeValue.InPerson,
        notes: 'First visit',
      }),
    );

    const found = await findHandler.execute(
      new FindAppointmentQuery({
        tenantId: tenant.id,
        appointmentId: scheduled.id,
      }),
    );

    assert.equal(found.id, scheduled.id);
    assert.equal(found.tenantId, tenant.id);
    assert.equal(found.patientId, patient.id);
    assert.equal(found.nutritionistId, nutritionist.id);
    assert.equal(found.startsAt, FUTURE_START);
    assert.equal(found.endsAt, FUTURE_END_15);
    assert.equal(found.mode, AppointmentModeValue.InPerson);
    assert.equal(found.status, AppointmentStatus.Scheduled);
    assert.equal(found.notes, 'First visit');
  });

  it('findById loads persisted aggregate from database', async () => {
    const { tenant, patient, nutritionist } = await createFixture();
    const scheduled = await createScheduleHandler().execute(
      new ScheduleAppointmentCommand({
        tenantId: tenant.id,
        patientId: patient.id,
        nutritionistId: nutritionist.id,
        startsAt: FUTURE_START,
        endsAt: FUTURE_END_15,
        mode: AppointmentModeValue.Online,
      }),
    );

    const aggregate = await appointmentRepository.findById(
      AppointmentId.create(scheduled.id),
    );

    assert.ok(aggregate);
    assert.equal(aggregate.getTenantId(), tenant.id);
    assert.equal(aggregate.getMode().toString(), AppointmentModeValue.Online);
  });

  it('returns no overlap for adjacent appointments in database', async () => {
    const { tenant, patient, nutritionist } = await createFixture();
    const scheduleHandler = createScheduleHandler();

    await scheduleHandler.execute(
      new ScheduleAppointmentCommand({
        tenantId: tenant.id,
        patientId: patient.id,
        nutritionistId: nutritionist.id,
        startsAt: FUTURE_START,
        endsAt: FUTURE_END_15,
        mode: AppointmentModeValue.InPerson,
      }),
    );

    const secondPatient = await new CreatePatientHandler(
      patientRepository,
      tenantRepository,
      noopEventDispatcher,
    ).execute(
      new CreatePatientCommand({
        tenantId: tenant.id,
        fullName: 'Maria Paciente',
        birthDate: '1990-01-01',
        gender: 'FEMALE',
      }),
    );

    await new AssignNutritionistToPatientHandler(
      assignmentRepository,
      patientRepository,
      patientNutritionistDirectory,
      tenantRepository,
      noopEventDispatcher,
    ).execute(
      new AssignNutritionistToPatientCommand({
        tenantId: tenant.id,
        patientId: secondPatient.id,
        nutritionistId: nutritionist.id,
        role: PatientNutritionistAssignmentRoleValue.Supporting,
      }),
    );

    const adjacent = await scheduleHandler.execute(
      new ScheduleAppointmentCommand({
        tenantId: tenant.id,
        patientId: secondPatient.id,
        nutritionistId: nutritionist.id,
        startsAt: FUTURE_END_15,
        endsAt: FUTURE_END_30,
        mode: AppointmentModeValue.InPerson,
      }),
    );

    assert.equal(adjacent.startsAt, FUTURE_END_15);
  });

  it('updates appointment status through repository save', async () => {
    const { tenant, patient, nutritionist } = await createFixture();
    const scheduled = await createScheduleHandler().execute(
      new ScheduleAppointmentCommand({
        tenantId: tenant.id,
        patientId: patient.id,
        nutritionistId: nutritionist.id,
        startsAt: FUTURE_START,
        endsAt: FUTURE_END_15,
        mode: AppointmentModeValue.InPerson,
      }),
    );

    const confirmed = await new ConfirmAppointmentHandler(
      appointmentRepository,
      clock,
      noopEventDispatcher,
    ).execute(
      new ConfirmAppointmentCommand({
        tenantId: tenant.id,
        appointmentId: scheduled.id,
      }),
    );

    assert.equal(confirmed.status, AppointmentStatus.Confirmed);

    const reloaded = await appointmentRepository.findById(
      AppointmentId.create(scheduled.id),
    );

    assert.ok(reloaded);
    assert.equal(reloaded.getStatus(), AppointmentStatus.Confirmed);
  });
});
