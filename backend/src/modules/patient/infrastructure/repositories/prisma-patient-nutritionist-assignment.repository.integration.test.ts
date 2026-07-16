import assert from 'node:assert/strict';
import { after, before, beforeEach, describe, it } from 'node:test';
import { PrismaClient } from '@prisma/client';
import { requireDatabaseUrl } from '../../../../config/test-env.js';
import { AddPersonToTenantCommand } from '../../../iam/application/add-person-to-tenant/add-person-to-tenant.command.js';
import { AddPersonToTenantHandler } from '../../../iam/application/add-person-to-tenant/add-person-to-tenant.handler.js';
import { CreatePersonCommand } from '../../../iam/application/create-person/create-person.command.js';
import { CreatePersonHandler } from '../../../iam/application/create-person/create-person.handler.js';
import { CreateTenantCommand } from '../../../iam/application/create-tenant/create-tenant.command.js';
import { CreateTenantHandler } from '../../../iam/application/create-tenant/create-tenant.handler.js';
import { DocumentType } from '../../../iam/domain/value-objects/document.js';
import { TenantId } from '../../../iam/domain/value-objects/tenant-id.js';
import { PrismaMembershipRepository } from '../../../iam/infrastructure/repositories/prisma-membership.repository.js';
import { PrismaPersonRepository } from '../../../iam/infrastructure/repositories/prisma-person.repository.js';
import { PrismaTenantRepository } from '../../../iam/infrastructure/repositories/prisma-tenant.repository.js';
import { noopEventDispatcher } from '../../../../test-support/noop-event-dispatcher.js';
import { CreateNutritionistCommand } from '../../../nutrition/application/create-nutritionist/create-nutritionist.command.js';
import { CreateNutritionistHandler } from '../../../nutrition/application/create-nutritionist/create-nutritionist.handler.js';
import { PrismaNutritionistRepository } from '../../../nutrition/infrastructure/repositories/prisma-nutritionist.repository.js';
import { AssignNutritionistToPatientCommand } from '../../application/assign-nutritionist-to-patient/assign-nutritionist-to-patient.command.js';
import { AssignNutritionistToPatientHandler } from '../../application/assign-nutritionist-to-patient/assign-nutritionist-to-patient.handler.js';
import { CreatePatientCommand } from '../../application/create-patient/create-patient.command.js';
import { CreatePatientHandler } from '../../application/create-patient/create-patient.handler.js';
import { PatientNutritionistAssignmentRoleValue } from '../../domain/value-objects/patient-nutritionist-assignment-role.js';
import { PatientId } from '../../domain/value-objects/patient-id.js';
import { PatientNutritionistAssignmentId } from '../../domain/value-objects/patient-nutritionist-assignment-id.js';
import { PrismaNutritionistDirectoryAdapter } from '../../infrastructure/adapters/prisma-nutritionist-directory.adapter.js';
import { PrismaPatientRepository } from './prisma-patient.repository.js';
import { PrismaPatientNutritionistAssignmentRepository } from './prisma-patient-nutritionist-assignment.repository.js';

requireDatabaseUrl();

const prisma = new PrismaClient();
const assignmentRepository = new PrismaPatientNutritionistAssignmentRepository(prisma);
const patientRepository = new PrismaPatientRepository(prisma);
const tenantRepository = new PrismaTenantRepository(prisma);
const personRepository = new PrismaPersonRepository(prisma);
const membershipRepository = new PrismaMembershipRepository(prisma);
const nutritionistRepository = new PrismaNutritionistRepository(prisma);
const nutritionistDirectory = new PrismaNutritionistDirectoryAdapter(prisma);

async function resetAssignments() {
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
      email: 'ana.assignment@example.com',
      documentType: DocumentType.PASSPORT,
      document: 'AS123456',
      birthDate: '1988-03-20',
    }),
  );

  const tenant = await new CreateTenantHandler(
    tenantRepository,
    noopEventDispatcher,
  ).execute(
    new CreateTenantCommand({
      name: 'Assignment Clinic',
      slug: 'assignment-clinic',
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
      crn: '54321',
      stateCode: 'SP',
      specialty: 'Sports Nutrition',
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

  return { tenant, patient, nutritionist };
}

function createAssignHandler() {
  return new AssignNutritionistToPatientHandler(
    assignmentRepository,
    patientRepository,
    nutritionistDirectory,
    tenantRepository,
    noopEventDispatcher,
  );
}

describe('PrismaPatientNutritionistAssignmentRepository (integration)', () => {
  before(async () => {
    await resetAssignments();
  });

  beforeEach(async () => {
    await resetAssignments();
  });

  after(async () => {
    await resetAssignments();
    await prisma.$disconnect();
  });

  it('persists and finds an assignment by id', async () => {
    const { tenant, patient, nutritionist } = await createFixture();
    const created = await createAssignHandler().execute(
      new AssignNutritionistToPatientCommand({
        tenantId: tenant.id,
        patientId: patient.id,
        nutritionistId: nutritionist.id,
        role: PatientNutritionistAssignmentRoleValue.Supporting,
      }),
    );

    const found = await assignmentRepository.findById(
      PatientNutritionistAssignmentId.create(created.id),
    );

    assert.ok(found);
    assert.equal(found?.getNutritionistId(), nutritionist.id);
  });

  it('finds assignment by tenant, patient and nutritionist', async () => {
    const { tenant, patient, nutritionist } = await createFixture();
    await createAssignHandler().execute(
      new AssignNutritionistToPatientCommand({
        tenantId: tenant.id,
        patientId: patient.id,
        nutritionistId: nutritionist.id,
        role: PatientNutritionistAssignmentRoleValue.Primary,
      }),
    );

    const found = await assignmentRepository.findByPatientAndNutritionist(
      TenantId.create(tenant.id),
      PatientId.create(patient.id),
      nutritionist.id,
    );

    assert.ok(found);
    assert.equal(found?.getRole().toString(), 'PRIMARY');
  });

  it('finds active primary and active assignments by patient and nutritionist', async () => {
    const { tenant, patient, nutritionist } = await createFixture();
    const personTwo = await new CreatePersonHandler(
      personRepository,
      noopEventDispatcher,
    ).execute(
      new CreatePersonCommand({
        fullName: 'Bruno Nutricionista',
        email: 'bruno.assignment@example.com',
        documentType: DocumentType.PASSPORT,
        document: 'AS654321',
        birthDate: '1987-04-12',
      }),
    );

    await new AddPersonToTenantHandler(
      membershipRepository,
      personRepository,
      tenantRepository,
      noopEventDispatcher,
    ).execute(
      new AddPersonToTenantCommand({
        personId: personTwo.id,
        tenantId: tenant.id,
      }),
    );

    const nutritionistTwo = await new CreateNutritionistHandler(
      nutritionistRepository,
      personRepository,
      tenantRepository,
      membershipRepository,
      noopEventDispatcher,
    ).execute(
      new CreateNutritionistCommand({
        personId: personTwo.id,
        tenantId: tenant.id,
        crn: '98765',
        stateCode: 'RJ',
        specialty: 'Pediatric Nutrition',
      }),
    );

    const assignHandler = createAssignHandler();
    await assignHandler.execute(
      new AssignNutritionistToPatientCommand({
        tenantId: tenant.id,
        patientId: patient.id,
        nutritionistId: nutritionist.id,
        role: PatientNutritionistAssignmentRoleValue.Primary,
      }),
    );
    await assignHandler.execute(
      new AssignNutritionistToPatientCommand({
        tenantId: tenant.id,
        patientId: patient.id,
        nutritionistId: nutritionistTwo.id,
        role: PatientNutritionistAssignmentRoleValue.Supporting,
      }),
    );

    const primary = await assignmentRepository.findActivePrimaryByPatient(
      TenantId.create(tenant.id),
      PatientId.create(patient.id),
    );
    const byPatient = await assignmentRepository.findActiveByPatient(
      TenantId.create(tenant.id),
      PatientId.create(patient.id),
    );
    const byNutritionist = await assignmentRepository.findActiveByNutritionist(
      TenantId.create(tenant.id),
      nutritionistTwo.id,
    );

    assert.equal(primary?.getNutritionistId(), nutritionist.id);
    assert.equal(byPatient.length, 2);
    assert.equal(byNutritionist.length, 1);
  });

  it('enforces unique patient and nutritionist pair', async () => {
    const { tenant, patient, nutritionist } = await createFixture();
    await createAssignHandler().execute(
      new AssignNutritionistToPatientCommand({
        tenantId: tenant.id,
        patientId: patient.id,
        nutritionistId: nutritionist.id,
        role: PatientNutritionistAssignmentRoleValue.Supporting,
      }),
    );

    await assert.rejects(
      () =>
        prisma.patientNutritionistAssignment.create({
          data: {
            tenantId: tenant.id,
            patientId: patient.id,
            nutritionistId: nutritionist.id,
            role: 'SUPPORTING',
            status: 'ACTIVE',
          },
        }),
      /Unique constraint failed/,
    );
  });

  it('enforces partial unique index for one active primary per patient', async () => {
    const { tenant, patient, nutritionist } = await createFixture();
    const personTwo = await new CreatePersonHandler(
      personRepository,
      noopEventDispatcher,
    ).execute(
      new CreatePersonCommand({
        fullName: 'Clara Nutricionista',
        email: 'clara.assignment@example.com',
        documentType: DocumentType.PASSPORT,
        document: 'AS111222',
        birthDate: '1986-08-18',
      }),
    );

    await new AddPersonToTenantHandler(
      membershipRepository,
      personRepository,
      tenantRepository,
      noopEventDispatcher,
    ).execute(
      new AddPersonToTenantCommand({
        personId: personTwo.id,
        tenantId: tenant.id,
      }),
    );

    const nutritionistTwo = await new CreateNutritionistHandler(
      nutritionistRepository,
      personRepository,
      tenantRepository,
      membershipRepository,
      noopEventDispatcher,
    ).execute(
      new CreateNutritionistCommand({
        personId: personTwo.id,
        tenantId: tenant.id,
        crn: '11223',
        stateCode: 'MG',
        specialty: 'Clinical Nutrition',
      }),
    );

    await createAssignHandler().execute(
      new AssignNutritionistToPatientCommand({
        tenantId: tenant.id,
        patientId: patient.id,
        nutritionistId: nutritionist.id,
        role: PatientNutritionistAssignmentRoleValue.Primary,
      }),
    );

    await assert.rejects(
      () =>
        prisma.patientNutritionistAssignment.create({
          data: {
            tenantId: tenant.id,
            patientId: patient.id,
            nutritionistId: nutritionistTwo.id,
            role: 'PRIMARY',
            status: 'ACTIVE',
          },
        }),
      /Unique constraint failed/,
    );
  });

  it('rejects assignment when patient foreign key is invalid', async () => {
    const { tenant, nutritionist } = await createFixture();

    await assert.rejects(
      () =>
        prisma.patientNutritionistAssignment.create({
          data: {
            tenantId: tenant.id,
            patientId: '550e8400-e29b-41d4-a716-446655440099',
            nutritionistId: nutritionist.id,
            role: 'SUPPORTING',
            status: 'ACTIVE',
          },
        }),
      /Foreign key constraint violated/,
    );
  });
});
