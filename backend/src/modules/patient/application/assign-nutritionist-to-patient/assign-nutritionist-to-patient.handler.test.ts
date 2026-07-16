import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { GenderValue } from '../../domain/value-objects/gender.js';
import { PatientNutritionistAssignmentRoleValue } from '../../domain/value-objects/patient-nutritionist-assignment-role.js';
import { PatientNutritionistAssignmentStatus } from '../../domain/value-objects/patient-nutritionist-assignment-status.js';
import { PatientNutritionistAssignment } from '../../domain/aggregates/patient-nutritionist-assignment.aggregate.js';
import { PatientNutritionistAssignmentRole } from '../../domain/value-objects/patient-nutritionist-assignment-role.js';
import { PatientId } from '../../domain/value-objects/patient-id.js';
import { TenantId } from '../../../iam/domain/value-objects/tenant-id.js';
import { CapturingEventDispatcher } from '../../../../test-support/capturing-event-dispatcher.js';
import { noopEventDispatcher } from '../../../../test-support/noop-event-dispatcher.js';
import { CreateTenantCommand } from '../../../iam/application/create-tenant/create-tenant.command.js';
import { CreateTenantHandler } from '../../../iam/application/create-tenant/create-tenant.handler.js';
import { InMemoryTenantRepository } from '../../../iam/infrastructure/repositories/in-memory-tenant.repository.js';
import { InMemoryPatientRepository } from '../../infrastructure/repositories/in-memory-patient.repository.js';
import { InMemoryPatientNutritionistAssignmentRepository } from '../../infrastructure/repositories/in-memory-patient-nutritionist-assignment.repository.js';
import { InMemoryNutritionistDirectory } from '../../infrastructure/adapters/in-memory-nutritionist-directory.js';
import type { NutritionistDirectoryPort } from '../ports/nutritionist-directory.port.js';
import { CreatePatientCommand } from '../create-patient/create-patient.command.js';
import { CreatePatientHandler } from '../create-patient/create-patient.handler.js';
import { DeactivatePatientCommand } from '../deactivate-patient/deactivate-patient.command.js';
import { DeactivatePatientHandler } from '../deactivate-patient/deactivate-patient.handler.js';
import { PatientNotFoundError } from '../errors/patient-not-found.error.js';
import { PatientInactiveError } from '../errors/patient-inactive.error.js';
import { NutritionistNotFoundForPatientAssignmentError } from '../errors/nutritionist-not-found-for-patient-assignment.error.js';
import { NutritionistInactiveForPatientAssignmentError } from '../errors/nutritionist-inactive-for-patient-assignment.error.js';
import { PatientNutritionistTenantMismatchError } from '../errors/patient-nutritionist-tenant-mismatch.error.js';
import { PatientNutritionistAssignmentAlreadyExistsError } from '../errors/patient-nutritionist-assignment-already-exists.error.js';
import { PatientPrimaryNutritionistAlreadyAssignedError } from '../errors/patient-primary-nutritionist-already-assigned.error.js';
import { PatientNutritionistAssignmentRoleMismatchError } from '../errors/patient-nutritionist-assignment-role-mismatch.error.js';
import { AssignNutritionistToPatientCommand } from './assign-nutritionist-to-patient.command.js';
import { AssignNutritionistToPatientHandler } from './assign-nutritionist-to-patient.handler.js';

const UNKNOWN_NUTRITIONIST_ID = '550e8400-e29b-41d4-a716-446655440099';
const OTHER_TENANT_ID = '550e8400-e29b-41d4-a716-446655440098';
const NUTRITIONIST_TWO_ID = '550e8400-e29b-41d4-a716-446655440097';

async function seedTenantAndPatient() {
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
      fullName: 'João Paciente',
      birthDate: '1990-01-15',
      gender: GenderValue.Male,
    }),
  );

  return { tenantRepository, patientRepository, tenant, patient };
}

function seedNutritionistDirectory(
  tenantId: string,
  nutritionistId: string,
  status: 'ACTIVE' | 'INACTIVE' = 'ACTIVE',
) {
  const nutritionistDirectory = new InMemoryNutritionistDirectory();
  nutritionistDirectory.seed({
    id: nutritionistId,
    tenantId,
    status,
  });
  return nutritionistDirectory;
}

function createHandler(deps: {
  assignmentRepository?: InMemoryPatientNutritionistAssignmentRepository;
  patientRepository: InMemoryPatientRepository;
  nutritionistDirectory: NutritionistDirectoryPort;
  tenantRepository: InMemoryTenantRepository;
  eventDispatcher?: CapturingEventDispatcher;
}) {
  return new AssignNutritionistToPatientHandler(
    deps.assignmentRepository ??
      new InMemoryPatientNutritionistAssignmentRepository(),
    deps.patientRepository,
    deps.nutritionistDirectory,
    deps.tenantRepository,
    deps.eventDispatcher ?? noopEventDispatcher,
  );
}

describe('AssignNutritionistToPatientHandler', () => {
  it('uses NutritionistDirectory port instead of Nutrition repository', async () => {
    const seeded = await seedTenantAndPatient();
    const nutritionistId = '550e8400-e29b-41d4-a716-446655440030';
    const nutritionistDirectory = seedNutritionistDirectory(
      seeded.tenant.id,
      nutritionistId,
    );

    let directoryCalled = false;
    const trackingDirectory: NutritionistDirectoryPort = {
      async findById(id: string) {
        directoryCalled = true;
        return nutritionistDirectory.findById(id);
      },
    };

    const handler = createHandler({
      ...seeded,
      nutritionistDirectory: trackingDirectory,
    });

    await handler.execute(
      new AssignNutritionistToPatientCommand({
        tenantId: seeded.tenant.id,
        patientId: seeded.patient.id,
        nutritionistId,
        role: PatientNutritionistAssignmentRoleValue.Supporting,
      }),
    );

    assert.equal(directoryCalled, true);
  });

  it('creates a new assignment', async () => {
    const seeded = await seedTenantAndPatient();
    const nutritionistId = '550e8400-e29b-41d4-a716-446655440031';
    const eventDispatcher = new CapturingEventDispatcher();
    const handler = createHandler({
      ...seeded,
      nutritionistDirectory: seedNutritionistDirectory(
        seeded.tenant.id,
        nutritionistId,
      ),
      eventDispatcher,
    });

    const result = await handler.execute(
      new AssignNutritionistToPatientCommand({
        tenantId: seeded.tenant.id,
        patientId: seeded.patient.id,
        nutritionistId,
        role: PatientNutritionistAssignmentRoleValue.Primary,
      }),
    );

    assert.equal(result.operation, 'CREATED');
    assert.equal(result.status, PatientNutritionistAssignmentStatus.Active);
    assert.equal(result.role, PatientNutritionistAssignmentRoleValue.Primary);
    assert.equal(eventDispatcher.dispatched.length, 1);
    assert.equal(
      (eventDispatcher.dispatched[0]?.[0] as { eventName: string }).eventName,
      'PatientNutritionistAssigned',
    );
  });

  it('reactivates a removed assignment with the same role', async () => {
    const seeded = await seedTenantAndPatient();
    const nutritionistId = '550e8400-e29b-41d4-a716-446655440032';
    const assignmentRepository = new InMemoryPatientNutritionistAssignmentRepository();
    const removed = PatientNutritionistAssignment.create({
      tenantId: TenantId.create(seeded.tenant.id),
      patientId: PatientId.create(seeded.patient.id),
      nutritionistId,
      role: PatientNutritionistAssignmentRole.supporting(),
    });
    removed.remove();
    removed.clearDomainEvents();
    await assignmentRepository.save(removed);

    const eventDispatcher = new CapturingEventDispatcher();
    const handler = createHandler({
      ...seeded,
      assignmentRepository,
      nutritionistDirectory: seedNutritionistDirectory(
        seeded.tenant.id,
        nutritionistId,
      ),
      eventDispatcher,
    });

    const result = await handler.execute(
      new AssignNutritionistToPatientCommand({
        tenantId: seeded.tenant.id,
        patientId: seeded.patient.id,
        nutritionistId,
        role: PatientNutritionistAssignmentRoleValue.Supporting,
      }),
    );

    assert.equal(result.operation, 'REACTIVATED');
    assert.equal(result.removedAt, null);
    assert.ok(result.reactivatedAt);
    assert.equal(
      (eventDispatcher.dispatched[0]?.[0] as { eventName: string }).eventName,
      'PatientNutritionistReactivated',
    );
  });

  it('fails reactivation when requested role differs from stored role', async () => {
    const seeded = await seedTenantAndPatient();
    const nutritionistId = '550e8400-e29b-41d4-a716-446655440033';
    const assignmentRepository = new InMemoryPatientNutritionistAssignmentRepository();
    const removed = PatientNutritionistAssignment.create({
      tenantId: TenantId.create(seeded.tenant.id),
      patientId: PatientId.create(seeded.patient.id),
      nutritionistId,
      role: PatientNutritionistAssignmentRole.supporting(),
    });
    removed.remove();
    await assignmentRepository.save(removed);

    const handler = createHandler({
      ...seeded,
      assignmentRepository,
      nutritionistDirectory: seedNutritionistDirectory(
        seeded.tenant.id,
        nutritionistId,
      ),
    });

    await assert.rejects(
      () =>
        handler.execute(
          new AssignNutritionistToPatientCommand({
            tenantId: seeded.tenant.id,
            patientId: seeded.patient.id,
            nutritionistId,
            role: PatientNutritionistAssignmentRoleValue.Primary,
          }),
        ),
      PatientNutritionistAssignmentRoleMismatchError,
    );
  });

  it('rejects duplicate active assignment', async () => {
    const seeded = await seedTenantAndPatient();
    const nutritionistId = '550e8400-e29b-41d4-a716-446655440034';
    const assignmentRepository = new InMemoryPatientNutritionistAssignmentRepository();
    await assignmentRepository.save(
      PatientNutritionistAssignment.create({
        tenantId: TenantId.create(seeded.tenant.id),
        patientId: PatientId.create(seeded.patient.id),
        nutritionistId,
        role: PatientNutritionistAssignmentRole.supporting(),
      }),
    );

    const handler = createHandler({
      ...seeded,
      assignmentRepository,
      nutritionistDirectory: seedNutritionistDirectory(
        seeded.tenant.id,
        nutritionistId,
      ),
    });

    await assert.rejects(
      () =>
        handler.execute(
          new AssignNutritionistToPatientCommand({
            tenantId: seeded.tenant.id,
            patientId: seeded.patient.id,
            nutritionistId,
            role: PatientNutritionistAssignmentRoleValue.Supporting,
          }),
        ),
      PatientNutritionistAssignmentAlreadyExistsError,
    );
  });

  it('rejects patient from another tenant', async () => {
    const seeded = await seedTenantAndPatient();
    const otherTenant = await new CreateTenantHandler(
      seeded.tenantRepository,
      noopEventDispatcher,
    ).execute(
      new CreateTenantCommand({
        name: 'Other Clinic',
        slug: 'other-clinic',
      }),
    );
    const nutritionistId = '550e8400-e29b-41d4-a716-446655440035';
    const handler = createHandler({
      ...seeded,
      nutritionistDirectory: seedNutritionistDirectory(
        otherTenant.id,
        nutritionistId,
      ),
    });

    await assert.rejects(
      () =>
        handler.execute(
          new AssignNutritionistToPatientCommand({
            tenantId: otherTenant.id,
            patientId: seeded.patient.id,
            nutritionistId,
            role: PatientNutritionistAssignmentRoleValue.Supporting,
          }),
        ),
      PatientNutritionistTenantMismatchError,
    );
  });

  it('rejects nutritionist from another tenant', async () => {
    const seeded = await seedTenantAndPatient();
    const nutritionistId = '550e8400-e29b-41d4-a716-446655440036';
    const handler = createHandler({
      ...seeded,
      nutritionistDirectory: seedNutritionistDirectory(
        OTHER_TENANT_ID,
        nutritionistId,
      ),
    });

    await assert.rejects(
      () =>
        handler.execute(
          new AssignNutritionistToPatientCommand({
            tenantId: seeded.tenant.id,
            patientId: seeded.patient.id,
            nutritionistId,
            role: PatientNutritionistAssignmentRoleValue.Supporting,
          }),
        ),
      PatientNutritionistTenantMismatchError,
    );
  });

  it('rejects inactive patient', async () => {
    const seeded = await seedTenantAndPatient();
    const nutritionistId = '550e8400-e29b-41d4-a716-446655440037';
    await new DeactivatePatientHandler(
      seeded.patientRepository,
      noopEventDispatcher,
    ).execute(new DeactivatePatientCommand(seeded.patient.id));

    const handler = createHandler({
      ...seeded,
      nutritionistDirectory: seedNutritionistDirectory(
        seeded.tenant.id,
        nutritionistId,
      ),
    });

    await assert.rejects(
      () =>
        handler.execute(
          new AssignNutritionistToPatientCommand({
            tenantId: seeded.tenant.id,
            patientId: seeded.patient.id,
            nutritionistId,
            role: PatientNutritionistAssignmentRoleValue.Supporting,
          }),
        ),
      PatientInactiveError,
    );
  });

  it('rejects inactive nutritionist', async () => {
    const seeded = await seedTenantAndPatient();
    const nutritionistId = '550e8400-e29b-41d4-a716-446655440038';
    const handler = createHandler({
      ...seeded,
      nutritionistDirectory: seedNutritionistDirectory(
        seeded.tenant.id,
        nutritionistId,
        'INACTIVE',
      ),
    });

    await assert.rejects(
      () =>
        handler.execute(
          new AssignNutritionistToPatientCommand({
            tenantId: seeded.tenant.id,
            patientId: seeded.patient.id,
            nutritionistId,
            role: PatientNutritionistAssignmentRoleValue.Supporting,
          }),
        ),
      NutritionistInactiveForPatientAssignmentError,
    );
  });

  it('rejects missing patient', async () => {
    const seeded = await seedTenantAndPatient();
    const handler = createHandler({
      ...seeded,
      nutritionistDirectory: seedNutritionistDirectory(
        seeded.tenant.id,
        UNKNOWN_NUTRITIONIST_ID,
      ),
    });

    await assert.rejects(
      () =>
        handler.execute(
          new AssignNutritionistToPatientCommand({
            tenantId: seeded.tenant.id,
            patientId: '550e8400-e29b-41d4-a716-446655440088',
            nutritionistId: UNKNOWN_NUTRITIONIST_ID,
            role: PatientNutritionistAssignmentRoleValue.Supporting,
          }),
        ),
      PatientNotFoundError,
    );
  });

  it('rejects missing nutritionist', async () => {
    const seeded = await seedTenantAndPatient();
    const handler = createHandler({
      ...seeded,
      nutritionistDirectory: new InMemoryNutritionistDirectory(),
    });

    await assert.rejects(
      () =>
        handler.execute(
          new AssignNutritionistToPatientCommand({
            tenantId: seeded.tenant.id,
            patientId: seeded.patient.id,
            nutritionistId: UNKNOWN_NUTRITIONIST_ID,
            role: PatientNutritionistAssignmentRoleValue.Supporting,
          }),
        ),
      NutritionistNotFoundForPatientAssignmentError,
    );
  });

  it('rejects PRIMARY conflict when another active PRIMARY exists', async () => {
    const seeded = await seedTenantAndPatient();
    const assignmentRepository = new InMemoryPatientNutritionistAssignmentRepository();
    await assignmentRepository.save(
      PatientNutritionistAssignment.create({
        tenantId: TenantId.create(seeded.tenant.id),
        patientId: PatientId.create(seeded.patient.id),
        nutritionistId: NUTRITIONIST_TWO_ID,
        role: PatientNutritionistAssignmentRole.primary(),
      }),
    );

    const handler = createHandler({
      ...seeded,
      assignmentRepository,
      nutritionistDirectory: seedNutritionistDirectory(
        seeded.tenant.id,
        '550e8400-e29b-41d4-a716-446655440039',
      ),
    });

    await assert.rejects(
      () =>
        handler.execute(
          new AssignNutritionistToPatientCommand({
            tenantId: seeded.tenant.id,
            patientId: seeded.patient.id,
            nutritionistId: '550e8400-e29b-41d4-a716-446655440039',
            role: PatientNutritionistAssignmentRoleValue.Primary,
          }),
        ),
      PatientPrimaryNutritionistAlreadyAssignedError,
    );
  });

  it('allows reactivating the same PRIMARY assignment without self-conflict', async () => {
    const seeded = await seedTenantAndPatient();
    const nutritionistId = '550e8400-e29b-41d4-a716-446655440040';
    const assignmentRepository = new InMemoryPatientNutritionistAssignmentRepository();
    const removed = PatientNutritionistAssignment.create({
      tenantId: TenantId.create(seeded.tenant.id),
      patientId: PatientId.create(seeded.patient.id),
      nutritionistId,
      role: PatientNutritionistAssignmentRole.primary(),
    });
    removed.remove();
    await assignmentRepository.save(removed);

    const handler = createHandler({
      ...seeded,
      assignmentRepository,
      nutritionistDirectory: seedNutritionistDirectory(
        seeded.tenant.id,
        nutritionistId,
      ),
    });

    const result = await handler.execute(
      new AssignNutritionistToPatientCommand({
        tenantId: seeded.tenant.id,
        patientId: seeded.patient.id,
        nutritionistId,
        role: PatientNutritionistAssignmentRoleValue.Primary,
      }),
    );

    assert.equal(result.operation, 'REACTIVATED');
    assert.equal(result.role, PatientNutritionistAssignmentRoleValue.Primary);
  });

  it('allows multiple active SUPPORTING assignments', async () => {
    const seeded = await seedTenantAndPatient();
    const assignmentRepository = new InMemoryPatientNutritionistAssignmentRepository();
    const nutritionistOne = '550e8400-e29b-41d4-a716-446655440041';
    const nutritionistTwo = '550e8400-e29b-41d4-a716-446655440042';

    const nutritionistDirectory = new InMemoryNutritionistDirectory();
    nutritionistDirectory.seed({
      id: nutritionistOne,
      tenantId: seeded.tenant.id,
      status: 'ACTIVE',
    });
    nutritionistDirectory.seed({
      id: nutritionistTwo,
      tenantId: seeded.tenant.id,
      status: 'ACTIVE',
    });

    const handler = createHandler({
      ...seeded,
      assignmentRepository,
      nutritionistDirectory,
    });

    await handler.execute(
      new AssignNutritionistToPatientCommand({
        tenantId: seeded.tenant.id,
        patientId: seeded.patient.id,
        nutritionistId: nutritionistOne,
        role: PatientNutritionistAssignmentRoleValue.Supporting,
      }),
    );

    const second = await handler.execute(
      new AssignNutritionistToPatientCommand({
        tenantId: seeded.tenant.id,
        patientId: seeded.patient.id,
        nutritionistId: nutritionistTwo,
        role: PatientNutritionistAssignmentRoleValue.Supporting,
      }),
    );

    assert.equal(second.operation, 'CREATED');
    const active = await assignmentRepository.findActiveByPatient(
      TenantId.create(seeded.tenant.id),
      PatientId.create(seeded.patient.id),
    );
    assert.equal(active.length, 2);
  });

  it('dispatches events only after successful persistence', async () => {
    const seeded = await seedTenantAndPatient();
    const nutritionistId = '550e8400-e29b-41d4-a716-446655440043';
    const eventDispatcher = new CapturingEventDispatcher();
    const failingRepository = new InMemoryPatientNutritionistAssignmentRepository();
    failingRepository.save = async () => {
      throw new Error('persistence failed');
    };

    const handler = createHandler({
      ...seeded,
      assignmentRepository: failingRepository,
      nutritionistDirectory: seedNutritionistDirectory(
        seeded.tenant.id,
        nutritionistId,
      ),
      eventDispatcher,
    });

    await assert.rejects(
      () =>
        handler.execute(
          new AssignNutritionistToPatientCommand({
            tenantId: seeded.tenant.id,
            patientId: seeded.patient.id,
            nutritionistId,
            role: PatientNutritionistAssignmentRoleValue.Supporting,
          }),
        ),
      /persistence failed/,
    );
    assert.equal(eventDispatcher.dispatched.length, 0);
  });
});
