import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { GenderValue } from '../../domain/value-objects/gender.js';
import { PatientStatus } from '../../domain/value-objects/patient-status.js';
import { CapturingEventDispatcher } from '../../../../test-support/capturing-event-dispatcher.js';
import { noopEventDispatcher } from '../../../../test-support/noop-event-dispatcher.js';
import { CreateTenantCommand } from '../../../iam/application/create-tenant/create-tenant.command.js';
import { CreateTenantHandler } from '../../../iam/application/create-tenant/create-tenant.handler.js';
import { InMemoryTenantRepository } from '../../../iam/infrastructure/repositories/in-memory-tenant.repository.js';
import { InMemoryPatientRepository } from '../../infrastructure/repositories/in-memory-patient.repository.js';
import { CreatePatientCommand } from '../create-patient/create-patient.command.js';
import { CreatePatientHandler } from '../create-patient/create-patient.handler.js';
import { PatientNotFoundError } from '../errors/patient-not-found.error.js';
import { DeactivatePatientCommand } from './deactivate-patient.command.js';
import { DeactivatePatientHandler } from './deactivate-patient.handler.js';

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
    }),
  );

  return { patientRepository, created };
}

describe('DeactivatePatientHandler', () => {
  it('deactivates an active patient', async () => {
    const { patientRepository, created } = await seedActivePatient();
    const handler = new DeactivatePatientHandler(
      patientRepository,
      noopEventDispatcher,
    );

    const result = await handler.execute(new DeactivatePatientCommand(created.id));

    assert.equal(result.status, PatientStatus.Inactive);
  });

  it('dispatches PatientDeactivated only when state changes', async () => {
    const { patientRepository, created } = await seedActivePatient();
    const eventDispatcher = new CapturingEventDispatcher();
    const handler = new DeactivatePatientHandler(
      patientRepository,
      eventDispatcher,
    );

    await handler.execute(new DeactivatePatientCommand(created.id));

    assert.equal(eventDispatcher.dispatched.length, 1);
    assert.equal(
      (eventDispatcher.dispatched[0]?.[0] as { eventName: string }).eventName,
      'PatientDeactivated',
    );

    await handler.execute(new DeactivatePatientCommand(created.id));

    assert.equal(eventDispatcher.dispatched.length, 1);
  });

  it('is idempotent when patient is already inactive', async () => {
    const { patientRepository, created } = await seedActivePatient();
    const eventDispatcher = new CapturingEventDispatcher();
    const handler = new DeactivatePatientHandler(
      patientRepository,
      eventDispatcher,
    );

    await handler.execute(new DeactivatePatientCommand(created.id));

    const result = await handler.execute(new DeactivatePatientCommand(created.id));

    assert.equal(result.status, PatientStatus.Inactive);
    assert.equal(eventDispatcher.dispatched.length, 1);
  });

  it('throws PatientNotFoundError when patient does not exist', async () => {
    const handler = new DeactivatePatientHandler(
      new InMemoryPatientRepository(),
      noopEventDispatcher,
    );

    await assert.rejects(
      () => handler.execute(new DeactivatePatientCommand(UNKNOWN_PATIENT_ID)),
      PatientNotFoundError,
    );
  });
});
