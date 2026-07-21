import type { PrismaClient } from '@prisma/client';
import type { EventDispatcher } from '../core/application/events/event-dispatcher.js';
import type { Clock } from '../modules/clinical/application/ports/clock.port.js';
import { StartAnamnesisCommand } from '../modules/clinical/application/start-anamnesis/start-anamnesis.command.js';
import { StartAnamnesisHandler } from '../modules/clinical/application/start-anamnesis/start-anamnesis.handler.js';
import { StartClinicalEncounterCommand } from '../modules/clinical/application/start-clinical-encounter/start-clinical-encounter.command.js';
import { StartClinicalEncounterHandler } from '../modules/clinical/application/start-clinical-encounter/start-clinical-encounter.handler.js';
import { ClinicalEncounterTypeValue } from '../modules/clinical/domain/value-objects/clinical-encounter-type.js';
import type { AnamnesisRepository } from '../modules/clinical/domain/repositories/anamnesis-repository.js';
import type { ClinicalEncounterRepository } from '../modules/clinical/domain/repositories/clinical-encounter-repository.js';
import type { AnamnesisDirectoryPort } from '../modules/clinical/application/ports/anamnesis-directory.port.js';
import type { AppointmentDirectoryPort } from '../modules/clinical/application/ports/appointment-directory.port.js';
import type { ClinicalEncounterDirectoryPort } from '../modules/clinical/application/ports/clinical-encounter-directory.port.js';
import type { NutritionistDirectoryPort } from '../modules/clinical/application/ports/nutritionist-directory.port.js';
import type { PatientDirectoryPort } from '../modules/clinical/application/ports/patient-directory.port.js';
import type { TenantDirectoryPort } from '../modules/clinical/application/ports/tenant-directory.port.js';
import { AddPersonToTenantCommand } from '../modules/iam/application/add-person-to-tenant/add-person-to-tenant.command.js';
import { AddPersonToTenantHandler } from '../modules/iam/application/add-person-to-tenant/add-person-to-tenant.handler.js';
import { CreatePersonCommand } from '../modules/iam/application/create-person/create-person.command.js';
import { CreatePersonHandler } from '../modules/iam/application/create-person/create-person.handler.js';
import { CreateTenantCommand } from '../modules/iam/application/create-tenant/create-tenant.command.js';
import { CreateTenantHandler } from '../modules/iam/application/create-tenant/create-tenant.handler.js';
import { DocumentType } from '../modules/iam/domain/value-objects/document.js';
import type { MembershipRepository } from '../modules/iam/domain/repositories/membership-repository.js';
import type { PersonRepository } from '../modules/iam/domain/repositories/person-repository.js';
import type { TenantRepository } from '../modules/iam/domain/repositories/tenant-repository.js';
import { CreateNutritionistCommand } from '../modules/nutrition/application/create-nutritionist/create-nutritionist.command.js';
import { CreateNutritionistHandler } from '../modules/nutrition/application/create-nutritionist/create-nutritionist.handler.js';
import type { NutritionistRepository } from '../modules/nutrition/domain/repositories/nutritionist-repository.js';
import { AssignNutritionistToPatientCommand } from '../modules/patient/application/assign-nutritionist-to-patient/assign-nutritionist-to-patient.command.js';
import { AssignNutritionistToPatientHandler } from '../modules/patient/application/assign-nutritionist-to-patient/assign-nutritionist-to-patient.handler.js';
import { CreatePatientCommand } from '../modules/patient/application/create-patient/create-patient.command.js';
import { CreatePatientHandler } from '../modules/patient/application/create-patient/create-patient.handler.js';
import { PatientNutritionistAssignmentRoleValue } from '../modules/patient/domain/value-objects/patient-nutritionist-assignment-role.js';
import type { PatientNutritionistAssignmentRepository } from '../modules/patient/domain/repositories/patient-nutritionist-assignment-repository.js';
import type { PatientRepository } from '../modules/patient/domain/repositories/patient-repository.js';
import type { NutritionistDirectoryPort as PatientNutritionistDirectoryPort } from '../modules/patient/application/ports/nutritionist-directory.port.js';

export interface ClinicalIntegrationFixtureRepositories {
  prisma: PrismaClient;
  tenantRepository: TenantRepository;
  personRepository: PersonRepository;
  membershipRepository: MembershipRepository;
  nutritionistRepository: NutritionistRepository;
  patientRepository: PatientRepository;
  assignmentRepository: PatientNutritionistAssignmentRepository;
  encounterRepository: ClinicalEncounterRepository;
  anamnesisRepository: AnamnesisRepository;
}

export interface ClinicalIntegrationFixtureDirectories {
  patientNutritionistDirectory: PatientNutritionistDirectoryPort;
  clinicalTenantDirectory: TenantDirectoryPort;
  clinicalPatientDirectory: PatientDirectoryPort;
  clinicalNutritionistDirectory: NutritionistDirectoryPort;
  clinicalAppointmentDirectory: AppointmentDirectoryPort;
  clinicalEncounterDirectory: ClinicalEncounterDirectoryPort;
  anamnesisDirectory: AnamnesisDirectoryPort;
}

export interface ClinicalIntegrationFixtureSeedOptions {
  patientBirthDate?: string;
  slug?: string;
  emailPrefix?: string;
  tenantName?: string;
  nutritionistCrn?: string;
}

export interface ClinicalIntegrationFixtureSeed {
  tenant: { id: string };
  patient: { id: string };
  nutritionist: { id: string };
}

export interface ClinicalIntegrationDraftAnamnesisContext {
  encounter: { id: string };
  anamnesis: { id: string };
}

export interface ClinicalIntegrationEncounterHandlers {
  startClinicalEncounterHandler: StartClinicalEncounterHandler;
  startAnamnesisHandler: StartAnamnesisHandler;
}

export async function resetClinicalIntegrationDatabase(
  prisma: PrismaClient,
  options?: { includeAssessments?: boolean },
): Promise<void> {
  if (options?.includeAssessments) {
    try {
      await prisma.clinicalObjective.deleteMany();
    }
    catch (error) {
      if (
        !(
          error instanceof Error
          && 'code' in error
          && error.code === 'P2021'
        )
      ) {
        throw error;
      }
    }

    await prisma.bodyCompositionAssessment.deleteMany();
    await prisma.anthropometricAssessment.deleteMany();
  }

  await prisma.anamnesis.deleteMany();
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

export async function seedClinicalIntegrationBase(
  repositories: ClinicalIntegrationFixtureRepositories,
  directories: Pick<
    ClinicalIntegrationFixtureDirectories,
    'patientNutritionistDirectory'
  >,
  eventDispatcher: EventDispatcher,
  options?: ClinicalIntegrationFixtureSeedOptions,
): Promise<ClinicalIntegrationFixtureSeed> {
  const uniqueSuffix = Date.now();
  const emailPrefix = options?.emailPrefix ?? 'clinical.integration';

  const person = await new CreatePersonHandler(
    repositories.personRepository,
    eventDispatcher,
  ).execute(
    new CreatePersonCommand({
      fullName: 'Ana Nutricionista',
      email: `${emailPrefix}.${uniqueSuffix}@example.com`,
      documentType: DocumentType.PASSPORT,
      document: `CI${uniqueSuffix}`,
      birthDate: '1988-03-20',
    }),
  );

  const tenant = await new CreateTenantHandler(
    repositories.tenantRepository,
    eventDispatcher,
  ).execute(
    new CreateTenantCommand({
      name: options?.tenantName ?? 'Clinical Integration Clinic',
      slug: options?.slug ?? `clinical-integration-${uniqueSuffix}`,
    }),
  );

  await new AddPersonToTenantHandler(
    repositories.membershipRepository,
    repositories.personRepository,
    repositories.tenantRepository,
    eventDispatcher,
  ).execute(
    new AddPersonToTenantCommand({
      personId: person.id,
      tenantId: tenant.id,
    }),
  );

  const nutritionist = await new CreateNutritionistHandler(
    repositories.nutritionistRepository,
    repositories.personRepository,
    repositories.tenantRepository,
    repositories.membershipRepository,
    eventDispatcher,
  ).execute(
    new CreateNutritionistCommand({
      personId: person.id,
      tenantId: tenant.id,
      crn: options?.nutritionistCrn ?? `${uniqueSuffix}`.slice(-5),
      stateCode: 'SP',
      specialty: 'Clinical Nutrition',
    }),
  );

  const patient = await new CreatePatientHandler(
    repositories.patientRepository,
    repositories.tenantRepository,
    eventDispatcher,
  ).execute(
    new CreatePatientCommand({
      tenantId: tenant.id,
      fullName: 'Carlos Paciente',
      birthDate: options?.patientBirthDate ?? '1992-07-10',
      gender: 'MALE',
    }),
  );

  await new AssignNutritionistToPatientHandler(
    repositories.assignmentRepository,
    repositories.patientRepository,
    directories.patientNutritionistDirectory,
    repositories.tenantRepository,
    eventDispatcher,
  ).execute(
    new AssignNutritionistToPatientCommand({
      tenantId: tenant.id,
      patientId: patient.id,
      nutritionistId: nutritionist.id,
      role: PatientNutritionistAssignmentRoleValue.Primary,
    }),
  );

  return {
    tenant: { id: tenant.id },
    patient: { id: patient.id },
    nutritionist: { id: nutritionist.id },
  };
}

export function createClinicalIntegrationEncounterHandlers(
  repositories: Pick<
    ClinicalIntegrationFixtureRepositories,
    'encounterRepository' | 'anamnesisRepository'
  >,
  directories: Pick<
    ClinicalIntegrationFixtureDirectories,
    | 'clinicalTenantDirectory'
    | 'clinicalPatientDirectory'
    | 'clinicalNutritionistDirectory'
    | 'clinicalAppointmentDirectory'
    | 'clinicalEncounterDirectory'
  >,
  clock: Clock,
  eventDispatcher: EventDispatcher,
): ClinicalIntegrationEncounterHandlers {
  return {
    startClinicalEncounterHandler: new StartClinicalEncounterHandler(
      repositories.encounterRepository,
      directories.clinicalTenantDirectory,
      directories.clinicalPatientDirectory,
      directories.clinicalNutritionistDirectory,
      directories.clinicalAppointmentDirectory,
      clock,
      eventDispatcher,
    ),
    startAnamnesisHandler: new StartAnamnesisHandler(
      repositories.anamnesisRepository,
      directories.clinicalTenantDirectory,
      directories.clinicalEncounterDirectory,
      clock,
      eventDispatcher,
    ),
  };
}

export async function seedClinicalIntegrationDraftAnamnesisContext(
  seed: ClinicalIntegrationFixtureSeed,
  handlers: ClinicalIntegrationEncounterHandlers,
): Promise<ClinicalIntegrationDraftAnamnesisContext> {
  const encounter = await handlers.startClinicalEncounterHandler.execute(
    new StartClinicalEncounterCommand({
      tenantId: seed.tenant.id,
      patientId: seed.patient.id,
      nutritionistId: seed.nutritionist.id,
      type: ClinicalEncounterTypeValue.Initial,
    }),
  );

  const anamnesis = await handlers.startAnamnesisHandler.execute(
    new StartAnamnesisCommand({
      tenantId: seed.tenant.id,
      clinicalEncounterId: encounter.id,
      patientId: seed.patient.id,
      nutritionistId: seed.nutritionist.id,
    }),
  );

  return {
    encounter: { id: encounter.id },
    anamnesis: { id: anamnesis.id },
  };
}
