import type { Nutritionist as NutritionistRecord } from '@prisma/client';
import { NutritionistStatus as PrismaNutritionistStatus } from '@prisma/client';
import { Nutritionist } from '../../domain/aggregates/nutritionist.aggregate.js';
import { Crn } from '../../domain/value-objects/crn.js';
import { NutritionistId } from '../../domain/value-objects/nutritionist-id.js';
import { NutritionistStatus } from '../../domain/value-objects/nutritionist-status.js';
import { Specialty } from '../../domain/value-objects/specialty.js';
import { StateCode } from '../../domain/value-objects/state-code.js';
import { PersonId } from '../../../iam/domain/value-objects/person-id.js';
import { TenantId } from '../../../iam/domain/value-objects/tenant-id.js';

export type NutritionistPersistenceInput = {
  id: string;
  personId: string;
  tenantId: string;
  crn: string;
  state: string;
  specialty: string;
  bio: string | null;
  status: PrismaNutritionistStatus;
  createdAt: Date;
  updatedAt: Date;
};

export function toPersistence(
  nutritionist: Nutritionist,
): NutritionistPersistenceInput {
  return {
    id: nutritionist.getId().toString(),
    personId: nutritionist.getPersonId().toString(),
    tenantId: nutritionist.getTenantId().toString(),
    crn: nutritionist.getCrn().toString(),
    state: nutritionist.getStateCode().toString(),
    specialty: nutritionist.getSpecialty().toString(),
    bio: nutritionist.getBio(),
    status: toPrismaNutritionistStatus(nutritionist.getStatus()),
    createdAt: nutritionist.getCreatedAt(),
    updatedAt: nutritionist.getUpdatedAt(),
  };
}

export function toDomain(record: NutritionistRecord): Nutritionist {
  return Nutritionist.reconstitute({
    id: NutritionistId.create(record.id),
    personId: PersonId.create(record.personId),
    tenantId: TenantId.create(record.tenantId),
    crn: Crn.create(record.crn),
    stateCode: StateCode.create(record.state),
    specialty: Specialty.create(record.specialty),
    bio: record.bio,
    status: toDomainNutritionistStatus(record.status),
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  });
}

function toPrismaNutritionistStatus(
  status: NutritionistStatus,
): PrismaNutritionistStatus {
  return status as PrismaNutritionistStatus;
}

function toDomainNutritionistStatus(
  status: PrismaNutritionistStatus,
): NutritionistStatus {
  return status as NutritionistStatus;
}
