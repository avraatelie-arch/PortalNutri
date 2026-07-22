import assert from 'node:assert/strict';
import { after, before, beforeEach, describe, it } from 'node:test';
import { PrismaClient } from '@prisma/client';
import { requireDatabaseUrl } from '../../../../config/test-env.js';
import { FixedClock } from '../../../../test-support/fixed-clock.js';
import { noopEventDispatcher } from '../../../../test-support/noop-event-dispatcher.js';
import { CompleteAppointmentCommand } from '../../../appointment/application/complete-appointment/complete-appointment.command.js';
import { CompleteAppointmentHandler } from '../../../appointment/application/complete-appointment/complete-appointment.handler.js';
import { ScheduleAppointmentCommand } from '../../../appointment/application/schedule-appointment/schedule-appointment.command.js';
import { ScheduleAppointmentHandler } from '../../../appointment/application/schedule-appointment/schedule-appointment.handler.js';
import { AppointmentModeValue } from '../../../appointment/domain/value-objects/appointment-mode.js';
import { PrismaNutritionistDirectoryAdapter as AppointmentNutritionistDirectoryAdapter } from '../../../appointment/infrastructure/adapters/prisma-nutritionist-directory.adapter.js';
import { PrismaPatientDirectoryAdapter as AppointmentPatientDirectoryAdapter } from '../../../appointment/infrastructure/adapters/prisma-patient-directory.adapter.js';
import { PrismaPatientNutritionistAssignmentDirectoryAdapter } from '../../../appointment/infrastructure/adapters/prisma-patient-nutritionist-assignment-directory.adapter.js';
import { PrismaTenantDirectoryAdapter as AppointmentTenantDirectoryAdapter } from '../../../appointment/infrastructure/adapters/prisma-tenant-directory.adapter.js';
import { PrismaAppointmentRepository } from '../../../appointment/infrastructure/repositories/prisma-appointment.repository.js';
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
import { FindClinicalEncounterQuery } from '../../application/find-clinical-encounter/find-clinical-encounter.query.js';
import { FindClinicalEncounterHandler } from '../../application/find-clinical-encounter/find-clinical-encounter.handler.js';
import { StartClinicalEncounterCommand } from '../../application/start-clinical-encounter/start-clinical-encounter.command.js';
import { StartClinicalEncounterHandler } from '../../application/start-clinical-encounter/start-clinical-encounter.handler.js';
import { ClinicalEncounter } from '../../domain/aggregates/clinical-encounter.aggregate.js';
import { ClinicalEncounterId } from '../../domain/value-objects/clinical-encounter-id.js';
import { ClinicalEncounterStatus } from '../../domain/value-objects/clinical-encounter-status.js';
import {
  ClinicalEncounterType,
  ClinicalEncounterTypeValue,
} from '../../domain/value-objects/clinical-encounter-type.js';
import { ClinicalNotes } from '../../domain/value-objects/clinical-notes.js';
import { PrismaAppointmentDirectoryAdapter } from '../adapters/prisma-appointment-directory.adapter.js';
import { PrismaNutritionistDirectoryAdapter as ClinicalNutritionistDirectoryAdapter } from '../adapters/prisma-nutritionist-directory.adapter.js';
import { PrismaPatientDirectoryAdapter } from '../adapters/prisma-patient-directory.adapter.js';
import { PrismaTenantDirectoryAdapter } from '../adapters/prisma-tenant-directory.adapter.js';
import { PrismaClinicalEncounterRepository } from './prisma-clinical-encounter.repository.js';

requireDatabaseUrl();

const NOW = new Date('2026-07-17T10:00:00.000Z');
const FUTURE_START = '2026-07-18T14:00:00.000Z';
const FUTURE_END_15 = '2026-07-18T14:15:00.000Z';

const ENCOUNTER_ID_ONE = '550e8400-e29b-41d4-a716-446655440050';
const ENCOUNTER_ID_TWO = '550e8400-e29b-41d4-a716-446655440051';

const prisma = new PrismaClient();
const appointmentRepository = new PrismaAppointmentRepository(prisma);
const encounterRepository = new PrismaClinicalEncounterRepository(prisma);
const tenantRepository = new PrismaTenantRepository(prisma);
const personRepository = new PrismaPersonRepository(prisma);
const membershipRepository = new PrismaMembershipRepository(prisma);
const nutritionistRepository = new PrismaNutritionistRepository(prisma);
const patientRepository = new PrismaPatientRepository(prisma);
const assignmentRepository = new PrismaPatientNutritionistAssignmentRepository(prisma);

const appointmentTenantDirectory = new AppointmentTenantDirectoryAdapter(prisma);
const appointmentPatientDirectory = new AppointmentPatientDirectoryAdapter(prisma);
const appointmentNutritionistDirectory = new AppointmentNutritionistDirectoryAdapter(prisma);
const appointmentAssignmentDirectory =
  new PrismaPatientNutritionistAssignmentDirectoryAdapter(prisma);
const patientNutritionistDirectory = new PrismaNutritionistDirectoryAdapter(prisma);

const clinicalTenantDirectory = new PrismaTenantDirectoryAdapter(prisma);
const clinicalPatientDirectory = new PrismaPatientDirectoryAdapter(prisma);
const clinicalNutritionistDirectory = new ClinicalNutritionistDirectoryAdapter(prisma);
const clinicalAppointmentDirectory = new PrismaAppointmentDirectoryAdapter(prisma);

const clock = new FixedClock(NOW);

async function resetDatabase() {
  await prisma.outcomeTracking.deleteMany();
  await prisma.clinicalEvolution.deleteMany();
  await prisma.anamnesis.deleteMany();
  await prisma.clinicalObjective.deleteMany();
  await prisma.prescription.deleteMany();
  await prisma.mealPlan.deleteMany();
  await prisma.nutritionDiagnosis.deleteMany();
  await prisma.bodyCompositionAssessment.deleteMany();
  await prisma.anthropometricAssessment.deleteMany();
  await prisma.clinicalEncounter.deleteMany();
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
      email: 'ana.clinical@example.com',
      documentType: DocumentType.PASSPORT,
      document: 'CL123456',
      birthDate: '1988-03-20',
    }),
  );

  const tenant = await new CreateTenantHandler(
    tenantRepository,
    noopEventDispatcher,
  ).execute(
    new CreateTenantCommand({
      name: 'Clinical Clinic',
      slug: 'clinical-clinic',
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
      crn: '76543',
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
    appointmentTenantDirectory,
    appointmentPatientDirectory,
    appointmentNutritionistDirectory,
    appointmentAssignmentDirectory,
    clock,
    noopEventDispatcher,
  );
}

function createStartEncounterHandler() {
  return new StartClinicalEncounterHandler(
    encounterRepository,
    clinicalTenantDirectory,
    clinicalPatientDirectory,
    clinicalNutritionistDirectory,
    clinicalAppointmentDirectory,
    clock,
    noopEventDispatcher,
  );
}

async function scheduleAndCompleteAppointment(fixture: Awaited<
  ReturnType<typeof createFixture>
>) {
  const scheduled = await createScheduleHandler().execute(
    new ScheduleAppointmentCommand({
      tenantId: fixture.tenant.id,
      patientId: fixture.patient.id,
      nutritionistId: fixture.nutritionist.id,
      startsAt: FUTURE_START,
      endsAt: FUTURE_END_15,
      mode: AppointmentModeValue.InPerson,
    }),
  );

  await new CompleteAppointmentHandler(
    appointmentRepository,
    clock,
    noopEventDispatcher,
  ).execute(
    new CompleteAppointmentCommand({
      tenantId: fixture.tenant.id,
      appointmentId: scheduled.id,
    }),
  );

  return scheduled;
}

function createEncounterAggregate(params: {
  id: string;
  tenantId: string;
  appointmentId: string;
  patientId: string;
  nutritionistId: string;
}) {
  return ClinicalEncounter.create({
    id: ClinicalEncounterId.create(params.id),
    tenantId: params.tenantId,
    appointmentId: params.appointmentId,
    patientId: params.patientId,
    nutritionistId: params.nutritionistId,
    type: ClinicalEncounterType.create(ClinicalEncounterTypeValue.Initial),
    notes: ClinicalNotes.create('Integration notes'),
    startedAt: clock.now(),
    now: clock.now(),
  });
}

describe('PrismaClinicalEncounterRepository (integration)', () => {
  before(async () => {
    await resetDatabase();
  });

  beforeEach(async () => {
    await resetDatabase();
  });

  after(async () => {
    await resetDatabase();
    await prisma.$disconnect();
  });

  it('persists and finds an encounter by tenant and id', async () => {
    const { tenant, patient, nutritionist } = await createFixture();
    const startHandler = createStartEncounterHandler();
    const findHandler = new FindClinicalEncounterHandler(encounterRepository);

    const started = await startHandler.execute(
      new StartClinicalEncounterCommand({
        tenantId: tenant.id,
        patientId: patient.id,
        nutritionistId: nutritionist.id,
        type: ClinicalEncounterTypeValue.Initial,
        notes: 'First encounter',
      }),
    );

    const found = await findHandler.execute(
      new FindClinicalEncounterQuery({
        tenantId: tenant.id,
        encounterId: started.id,
      }),
    );

    assert.equal(found.id, started.id);
    assert.equal(found.tenantId, tenant.id);
    assert.equal(found.patientId, patient.id);
    assert.equal(found.nutritionistId, nutritionist.id);
    assert.equal(found.type, ClinicalEncounterTypeValue.Initial);
    assert.equal(found.status, ClinicalEncounterStatus.Open);
    assert.equal(found.notes, 'First encounter');
    assert.equal(found.startedAt, NOW.toISOString());
    assert.equal(found.finishedAt, null);

    const aggregate = await encounterRepository.findByTenantAndId(
      tenant.id,
      ClinicalEncounterId.create(started.id),
    );

    assert.ok(aggregate);
    assert.equal(aggregate.getTenantId(), tenant.id);
    assert.equal(aggregate.getStatus(), ClinicalEncounterStatus.Open);
  });

  it('finds encounter by appointment', async () => {
    const fixture = await createFixture();
    const scheduled = await scheduleAndCompleteAppointment(fixture);
    const startHandler = createStartEncounterHandler();

    const started = await startHandler.execute(
      new StartClinicalEncounterCommand({
        tenantId: fixture.tenant.id,
        patientId: fixture.patient.id,
        nutritionistId: fixture.nutritionist.id,
        appointmentId: scheduled.id,
        type: ClinicalEncounterTypeValue.FollowUp,
      }),
    );

    const found = await encounterRepository.findByAppointment(
      fixture.tenant.id,
      scheduled.id,
    );

    assert.ok(found);
    assert.equal(found.getId().toString(), started.id);
    assert.equal(found.getAppointmentId(), scheduled.id);
  });

  it('finds open encounter for patient and nutritionist pair', async () => {
    const { tenant, patient, nutritionist } = await createFixture();
    const startHandler = createStartEncounterHandler();

    await startHandler.execute(
      new StartClinicalEncounterCommand({
        tenantId: tenant.id,
        patientId: patient.id,
        nutritionistId: nutritionist.id,
        type: ClinicalEncounterTypeValue.Initial,
      }),
    );

    const openEncounter = await encounterRepository.findOpenEncounter(
      tenant.id,
      patient.id,
      nutritionist.id,
    );

    assert.ok(openEncounter);
    assert.equal(openEncounter.getStatus(), ClinicalEncounterStatus.Open);
    assert.equal(openEncounter.getPatientId(), patient.id);
    assert.equal(openEncounter.getNutritionistId(), nutritionist.id);
  });

  it('rejects duplicate appointmentId via unique constraint', async () => {
    const fixture = await createFixture();
    const scheduled = await scheduleAndCompleteAppointment(fixture);

    const first = createEncounterAggregate({
      id: ENCOUNTER_ID_ONE,
      tenantId: fixture.tenant.id,
      appointmentId: scheduled.id,
      patientId: fixture.patient.id,
      nutritionistId: fixture.nutritionist.id,
    });
    first.clearDomainEvents();

    await encounterRepository.save(first);

    const second = createEncounterAggregate({
      id: ENCOUNTER_ID_TWO,
      tenantId: fixture.tenant.id,
      appointmentId: scheduled.id,
      patientId: fixture.patient.id,
      nutritionistId: fixture.nutritionist.id,
    });
    second.clearDomainEvents();

    await assert.rejects(
      () => encounterRepository.save(second),
      (error: unknown) => {
        assert.ok(error instanceof Error);
        return /Unique constraint failed/i.test(error.message);
      },
    );
  });
});
