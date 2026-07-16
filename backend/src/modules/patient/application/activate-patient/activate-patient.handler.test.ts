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
import { DeactivatePatientCommand } from '../deactivate-patient/deactivate-patient.command.js';
import { DeactivatePatientHandler } from '../deactivate-patient/deactivate-patient.handler.js';
import { PatientNotFoundError } from '../errors/patient-not-found.error.js';
import { ActivatePatientCommand } from './activate-patient.command.js';
import { ActivatePatientHandler } from './activate-patient.handler.js';

const UNKNOWN_PATIENT_ID = '550e8400-e29b-41d4-a716-446655440099';

async function seedInactivePatient(
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

  await new DeactivatePatientHandler(
    patientRepository,
    noopEventDispatcher,
  ).execute(new DeactivatePatientCommand(created.id));

  return { patientRepository, created };
}

describe('ActivatePatientHandler', () => {
  it('activates an inactive patient', async () => {
    const { patientRepository, created } = await seedInactivePatient();
    const handler = new ActivatePatientHandler(
      patientRepository,
      noopEventDispatcher,
    );

    const result = await handler.execute(
      new ActivatePatientCommand(created.id),
    );

    assert.equal(result.status, PatientStatus.Active);
  });

  it('dispatches PatientActivated only when state changes', async () => {
    const { patientRepository, created } = await seedInactivePatient();
    const eventDispatcher = new CapturingEventDispatcher();
    const handler = new ActivatePatientHandler(
      patientRepository,
      eventDispatcher,
    );

    await handler.execute(new ActivatePatientCommand(created.id));

    assert.equal(eventDispatcher.dispatched.length, 1);
    assert.equal(
      (eventDispatcher.dispatched[0]?.[0] as { eventName: string }).eventName,
      'PatientActivated',
    );
  });

  it('is idempotent when patient is already active', async () => {
    const { patientRepository, created } = await seedInactivePatient();
    const eventDispatcher = new CapturingEventDispatcher();
    const handler = new ActivatePatientHandler(
      patientRepository,
      eventDispatcher,
    );

    await handler.execute(new ActivatePatientCommand(created.id));
    await handler.execute(new ActivatePatientCommand(created.id));

    assert.equal(eventDispatcher.dispatched.length, 1);
    assert.equal(
      (eventDispatcher.dispatched[0]?.[0] as { eventName: string }).eventName,
      'PatientActivated',
    );
  });

  it('throws PatientNotFoundError when patient does not exist', async () => {
    const handler = new ActivatePatientHandler(
      new InMemoryPatientRepository(),
      noopEventDispatcher,
    );

    await assert.rejects(
      () => handler.execute(new ActivatePatientCommand(UNKNOWN_PATIENT_ID)),
      PatientNotFoundError,
    );
  });
});
