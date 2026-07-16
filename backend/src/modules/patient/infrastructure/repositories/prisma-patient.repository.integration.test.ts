import assert from 'node:assert/strict';
import { after, before, beforeEach, describe, it } from 'node:test';
import { PrismaClient } from '@prisma/client';
import { requireDatabaseUrl } from '../../../../config/test-env.js';
import { CreateTenantCommand } from '../../../iam/application/create-tenant/create-tenant.command.js';
import { CreateTenantHandler } from '../../../iam/application/create-tenant/create-tenant.handler.js';
import { TenantId } from '../../../iam/domain/value-objects/tenant-id.js';
import { PrismaTenantRepository } from '../../../iam/infrastructure/repositories/prisma-tenant.repository.js';
import { noopEventDispatcher } from '../../../../test-support/noop-event-dispatcher.js';
import { CreatePatientCommand } from '../../application/create-patient/create-patient.command.js';
import { CreatePatientHandler } from '../../application/create-patient/create-patient.handler.js';
import { FindPatientQuery } from '../../application/find-patient/find-patient.query.js';
import { FindPatientHandler } from '../../application/find-patient/find-patient.handler.js';
import { PatientId } from '../../domain/value-objects/patient-id.js';
import { PatientStatus } from '../../domain/value-objects/patient-status.js';
import { PrismaPatientRepository } from './prisma-patient.repository.js';

requireDatabaseUrl();

const prisma = new PrismaClient();
const repository = new PrismaPatientRepository(prisma);
const tenantRepository = new PrismaTenantRepository(prisma);

async function resetPatients() {
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

async function createTenantFixture() {
  const tenant = await new CreateTenantHandler(
    tenantRepository,
    noopEventDispatcher,
  ).execute(
    new CreateTenantCommand({
      name: 'Nutrition Clinic',
      slug: 'nutrition-clinic',
    }),
  );

  return { tenant };
}

describe('PrismaPatientRepository (integration)', () => {
  before(async () => {
    await resetPatients();
  });

  beforeEach(async () => {
    await resetPatients();
  });

  after(async () => {
    await resetPatients();
    await prisma.$disconnect();
  });

  it('persists and finds a patient by id', async () => {
    const { tenant } = await createTenantFixture();
    const createHandler = new CreatePatientHandler(
      repository,
      tenantRepository,
      noopEventDispatcher,
    );
    const findHandler = new FindPatientHandler(repository);

    const created = await createHandler.execute(
      new CreatePatientCommand({
        tenantId: tenant.id,
        fullName: 'Joao Paciente',
        birthDate: '1990-05-15',
        gender: 'MALE',
        phone: '+5511999999999',
        email: 'joao.paciente@example.com',
      }),
    );

    const found = await findHandler.execute(new FindPatientQuery(created.id));

    assert.equal(found.id, created.id);
    assert.equal(found.tenantId, tenant.id);
    assert.equal(found.fullName, 'Joao Paciente');
    assert.equal(found.birthDate, '1990-05-15');
    assert.equal(found.gender, 'MALE');
    assert.equal(found.phone, '+5511999999999');
    assert.equal(found.email, 'joao.paciente@example.com');
    assert.equal(found.status, PatientStatus.Active);
  });

  it('findByTenantId returns patients for tenant', async () => {
    const { tenant } = await createTenantFixture();
    const createHandler = new CreatePatientHandler(
      repository,
      tenantRepository,
      noopEventDispatcher,
    );

    const firstPatient = await createHandler.execute(
      new CreatePatientCommand({
        tenantId: tenant.id,
        fullName: 'Maria Paciente',
        birthDate: '1985-01-10',
        gender: 'FEMALE',
      }),
    );

    const secondPatient = await createHandler.execute(
      new CreatePatientCommand({
        tenantId: tenant.id,
        fullName: 'Pedro Paciente',
        birthDate: '1992-08-22',
        gender: 'MALE',
      }),
    );

    const patients = await repository.findByTenantId(
      TenantId.create(tenant.id),
    );

    assert.equal(patients.length, 2);
    assert.deepEqual(
      patients.map((patient) => patient.getId().toString()).sort(),
      [firstPatient.id, secondPatient.id].sort(),
    );
  });

  it('returns null when patient does not exist', async () => {
    const found = await repository.findById(
      PatientId.create('550e8400-e29b-41d4-a716-446655440099'),
    );

    assert.equal(found, null);
  });
});
