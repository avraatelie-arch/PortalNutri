import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { GenderValue } from '../../domain/value-objects/gender.js';
import { CapturingEventDispatcher } from '../../../../test-support/capturing-event-dispatcher.js';
import { noopEventDispatcher } from '../../../../test-support/noop-event-dispatcher.js';
import { CreateTenantCommand } from '../../../iam/application/create-tenant/create-tenant.command.js';
import { CreateTenantHandler } from '../../../iam/application/create-tenant/create-tenant.handler.js';
import { InMemoryTenantRepository } from '../../../iam/infrastructure/repositories/in-memory-tenant.repository.js';
import { InMemoryPatientRepository } from '../../infrastructure/repositories/in-memory-patient.repository.js';
import { CreatePatientCommand } from '../create-patient/create-patient.command.js';
import { CreatePatientHandler } from '../create-patient/create-patient.handler.js';
import { DeactivatePatientCommand } from '../deactivate-patient/deactivate-patient.command.js';
import { DeactivatePatientHandler } from '../deactivate-patient/deactivate-patient.handler.js';
import { PatientNotFoundError } from '../errors/patient-not-found.error.js';
import { PatientValidationError } from '../errors/patient-validation.error.js';
import { UpdatePatientProfileCommand } from './update-patient-profile.command.js';
import { UpdatePatientProfileHandler } from './update-patient-profile.handler.js';

const UNKNOWN_PATIENT_ID = '550e8400-e29b-41d4-a716-446655440099';

async function seedActivePatient(
  patientRepository = new InMemoryPatientRepository(),
) {
  const tenantRepository = new InMemoryTenantRepository();

  const tenant = await new CreateTenantHandler(
    tenantRepository,
    noopEventDispatcher,
  ).execute(
    new CreateTenantCommand({
      name: 'Portal Nutri Clinic',
      slug: 'portal-nutri-clinic',
    }),
  );

  const created = await new CreatePatientHandler(
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

  return { patientRepository, created };
}

describe('UpdatePatientProfileHandler', () => {
  it('updates fullName, birthDate, gender, phone and email', async () => {
    const { patientRepository, created } = await seedActivePatient();
    const handler = new UpdatePatientProfileHandler(
      patientRepository,
      noopEventDispatcher,
    );

    const result = await handler.execute(
      new UpdatePatientProfileCommand({
        patientId: created.id,
        fullName: 'João Pereira Santos',
        birthDate: '1986-04-10',
        gender: GenderValue.Other,
        phone: '21999887766',
        email: 'joao.santos@example.com',
      }),
    );

    assert.equal(result.fullName, 'João Pereira Santos');
    assert.equal(result.birthDate, '1986-04-10');
    assert.equal(result.gender, GenderValue.Other);
    assert.equal(result.phone, '21999887766');
    assert.equal(result.email, 'joao.santos@example.com');
  });

  it('dispatches PatientProfileUpdated only when profile changes', async () => {
    const { patientRepository, created } = await seedActivePatient();
    const eventDispatcher = new CapturingEventDispatcher();
    const handler = new UpdatePatientProfileHandler(
      patientRepository,
      eventDispatcher,
    );

    await handler.execute(
      new UpdatePatientProfileCommand({
        patientId: created.id,
        fullName: 'João Pereira Santos',
      }),
    );

    assert.equal(eventDispatcher.dispatched.length, 1);
    assert.equal(
      (eventDispatcher.dispatched[0]?.[0] as { eventName: string }).eventName,
      'PatientProfileUpdated',
    );

    await handler.execute(
      new UpdatePatientProfileCommand({
        patientId: created.id,
        fullName: 'João Pereira Santos',
        phone: '11987654321',
        email: 'joao.pereira@example.com',
      }),
    );

    assert.equal(eventDispatcher.dispatched.length, 1);
  });

  it('clears phone and email when set to null', async () => {
    const { patientRepository, created } = await seedActivePatient();
    const handler = new UpdatePatientProfileHandler(
      patientRepository,
      noopEventDispatcher,
    );

    const result = await handler.execute(
      new UpdatePatientProfileCommand({
        patientId: created.id,
        phone: null,
        email: null,
      }),
    );

    assert.equal(result.phone, null);
    assert.equal(result.email, null);
  });

  it('throws PatientNotFoundError when patient does not exist', async () => {
    const handler = new UpdatePatientProfileHandler(
      new InMemoryPatientRepository(),
      noopEventDispatcher,
    );

    await assert.rejects(
      () =>
        handler.execute(
          new UpdatePatientProfileCommand({
            patientId: UNKNOWN_PATIENT_ID,
            fullName: 'Another Name Here',
          }),
        ),
      PatientNotFoundError,
    );
  });

  it('throws PatientValidationError when patient is inactive', async () => {
    const { patientRepository, created } = await seedActivePatient();

    await new DeactivatePatientHandler(
      patientRepository,
      noopEventDispatcher,
    ).execute(new DeactivatePatientCommand(created.id));

    const handler = new UpdatePatientProfileHandler(
      patientRepository,
      noopEventDispatcher,
    );

    await assert.rejects(
      () =>
        handler.execute(
          new UpdatePatientProfileCommand({
            patientId: created.id,
            fullName: 'Another Name Here',
          }),
        ),
      PatientValidationError,
    );
  });
});
