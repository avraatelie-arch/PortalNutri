import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { GenderValue } from '../../domain/value-objects/gender.js';
import { PatientStatus } from '../../domain/value-objects/patient-status.js';
import { CapturingEventDispatcher } from '../../../../test-support/capturing-event-dispatcher.js';
import { noopEventDispatcher } from '../../../../test-support/noop-event-dispatcher.js';
import { CreateTenantCommand } from '../../../iam/application/create-tenant/create-tenant.command.js';
import { CreateTenantHandler } from '../../../iam/application/create-tenant/create-tenant.handler.js';
import { DeactivateTenantCommand } from '../../../iam/application/deactivate-tenant/deactivate-tenant.command.js';
import { DeactivateTenantHandler } from '../../../iam/application/deactivate-tenant/deactivate-tenant.handler.js';
import { TenantInactiveError } from '../../../iam/application/errors/tenant-inactive.error.js';
import { TenantNotFoundError } from '../../../iam/application/errors/tenant-not-found.error.js';
import { InMemoryTenantRepository } from '../../../iam/infrastructure/repositories/in-memory-tenant.repository.js';
import { InMemoryPatientRepository } from '../../infrastructure/repositories/in-memory-patient.repository.js';
import { PatientValidationError } from '../errors/patient-validation.error.js';
import { CreatePatientCommand } from './create-patient.command.js';
import { CreatePatientHandler } from './create-patient.handler.js';

const UNKNOWN_TENANT_ID = '550e8400-e29b-41d4-a716-446655440098';

async function seedActiveTenant(
  tenantRepository = new InMemoryTenantRepository(),
) {
  const tenant = await new CreateTenantHandler(
    tenantRepository,
    noopEventDispatcher,
  ).execute(
    new CreateTenantCommand({
      name: 'Portal Nutri Clinic',
      slug: 'portal-nutri-clinic',
    }),
  );

  return { tenantRepository, tenant };
}

function createHandler(deps: {
  patientRepository?: InMemoryPatientRepository;
  tenantRepository: InMemoryTenantRepository;
  eventDispatcher?: CapturingEventDispatcher;
}) {
  return new CreatePatientHandler(
    deps.patientRepository ?? new InMemoryPatientRepository(),
    deps.tenantRepository,
    deps.eventDispatcher ?? noopEventDispatcher,
  );
}

describe('CreatePatientHandler', () => {
  it('creates a patient when preconditions are met', async () => {
    const seeded = await seedActiveTenant();
    const handler = createHandler(seeded);

    const response = await handler.execute(
      new CreatePatientCommand({
        tenantId: seeded.tenant.id,
        fullName: 'João Pereira',
        birthDate: '1985-03-20',
        gender: GenderValue.Male,
        phone: '11987654321',
        email: 'joao.pereira@example.com',
      }),
    );

    assert.equal(response.tenantId, seeded.tenant.id);
    assert.equal(response.fullName, 'João Pereira');
    assert.equal(response.birthDate, '1985-03-20');
    assert.equal(response.gender, GenderValue.Male);
    assert.equal(response.phone, '11987654321');
    assert.equal(response.email, 'joao.pereira@example.com');
    assert.equal(response.status, PatientStatus.Active);
  });

  it('creates a patient without optional phone and email', async () => {
    const seeded = await seedActiveTenant();
    const handler = createHandler(seeded);

    const response = await handler.execute(
      new CreatePatientCommand({
        tenantId: seeded.tenant.id,
        fullName: 'João Pereira',
        birthDate: '1985-03-20',
        gender: GenderValue.NotInformed,
      }),
    );

    assert.equal(response.phone, null);
    assert.equal(response.email, null);
  });

  it('dispatches PatientCreated after persistence', async () => {
    const seeded = await seedActiveTenant();
    const eventDispatcher = new CapturingEventDispatcher();
    const handler = createHandler({ ...seeded, eventDispatcher });

    await handler.execute(
      new CreatePatientCommand({
        tenantId: seeded.tenant.id,
        fullName: 'João Pereira',
        birthDate: '1985-03-20',
        gender: GenderValue.Male,
      }),
    );

    assert.equal(eventDispatcher.dispatched.length, 1);
    assert.equal(
      (eventDispatcher.dispatched[0]?.[0] as { eventName: string }).eventName,
      'PatientCreated',
    );
  });

  it('throws TenantNotFoundError when tenant does not exist', async () => {
    const seeded = await seedActiveTenant();
    const handler = createHandler(seeded);

    await assert.rejects(
      () =>
        handler.execute(
          new CreatePatientCommand({
            tenantId: UNKNOWN_TENANT_ID,
            fullName: 'João Pereira',
            birthDate: '1985-03-20',
            gender: GenderValue.Male,
          }),
        ),
      TenantNotFoundError,
    );
  });

  it('throws TenantInactiveError when tenant is inactive', async () => {
    const tenantRepository = new InMemoryTenantRepository();
    const seeded = await seedActiveTenant(tenantRepository);

    await new DeactivateTenantHandler(
      tenantRepository,
      noopEventDispatcher,
    ).execute(new DeactivateTenantCommand(seeded.tenant.id));

    const handler = createHandler({ tenantRepository });

    await assert.rejects(
      () =>
        handler.execute(
          new CreatePatientCommand({
            tenantId: seeded.tenant.id,
            fullName: 'João Pereira',
            birthDate: '1985-03-20',
            gender: GenderValue.Male,
          }),
        ),
      TenantInactiveError,
    );
  });

  it('throws PatientValidationError for invalid birth date format', async () => {
    const seeded = await seedActiveTenant();
    const handler = createHandler(seeded);

    await assert.rejects(
      () =>
        handler.execute(
          new CreatePatientCommand({
            tenantId: seeded.tenant.id,
            fullName: 'João Pereira',
            birthDate: '20/03/1985',
            gender: GenderValue.Male,
          }),
        ),
      PatientValidationError,
    );
  });
});
