import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { GenderValue } from '../../domain/value-objects/gender.js';
import { PatientStatus } from '../../domain/value-objects/patient-status.js';
import { noopEventDispatcher } from '../../../../test-support/noop-event-dispatcher.js';
import { CreateTenantCommand } from '../../../iam/application/create-tenant/create-tenant.command.js';
import { CreateTenantHandler } from '../../../iam/application/create-tenant/create-tenant.handler.js';
import { InMemoryTenantRepository } from '../../../iam/infrastructure/repositories/in-memory-tenant.repository.js';
import { InMemoryPatientRepository } from '../../infrastructure/repositories/in-memory-patient.repository.js';
import { CreatePatientCommand } from '../create-patient/create-patient.command.js';
import { CreatePatientHandler } from '../create-patient/create-patient.handler.js';
import { PatientNotFoundError } from '../errors/patient-not-found.error.js';
import { FindPatientHandler } from './find-patient.handler.js';
import { FindPatientQuery } from './find-patient.query.js';

const UNKNOWN_PATIENT_ID = '550e8400-e29b-41d4-a716-446655440099';

async function seedPatient() {
  const tenantRepository = new InMemoryTenantRepository();
  const patientRepository = new InMemoryPatientRepository();

  const tenant = await new CreateTenantHandler(
    tenantRepository,
    noopEventDispatcher,
  ).execute(
    new CreateTenantCommand({
      name: 'Portal Nutri Clinic',
      slug: 'portal-nutri-clinic',
    }),
  );

  const patient = await new CreatePatientHandler(
    patientRepository,
    tenantRepository,
    noopEventDispatcher,
  ).execute(
    new CreatePatientCommand({
      tenantId: tenant.id,
      fullName: 'João Pereira',
      birthDate: '1985-03-20',
      gender: GenderValue.Male,
      phone: '11987654321',
      email: 'joao.pereira@example.com',
    }),
  );

  return { patientRepository, patient };
}

describe('FindPatientHandler', () => {
  it('finds a patient by id', async () => {
    const { patientRepository, patient } = await seedPatient();
    const handler = new FindPatientHandler(patientRepository);

    const result = await handler.execute(new FindPatientQuery(patient.id));

    assert.equal(result.id, patient.id);
    assert.equal(result.tenantId, patient.tenantId);
    assert.equal(result.fullName, 'João Pereira');
    assert.equal(result.birthDate, '1985-03-20');
    assert.equal(result.gender, GenderValue.Male);
    assert.equal(result.phone, '11987654321');
    assert.equal(result.email, 'joao.pereira@example.com');
    assert.equal(result.status, PatientStatus.Active);
  });

  it('throws PatientNotFoundError when patient does not exist', async () => {
    const handler = new FindPatientHandler(new InMemoryPatientRepository());

    await assert.rejects(
      () => handler.execute(new FindPatientQuery(UNKNOWN_PATIENT_ID)),
      PatientNotFoundError,
    );
  });
});
