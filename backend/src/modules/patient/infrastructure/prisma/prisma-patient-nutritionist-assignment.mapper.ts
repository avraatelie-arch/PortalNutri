import type { PatientNutritionistAssignment as AssignmentRecord } from '@prisma/client';
import {
  PatientNutritionistAssignmentRole as PrismaRole,
  PatientNutritionistAssignmentStatus as PrismaStatus,
} from '@prisma/client';
import { PatientNutritionistAssignment } from '../../domain/aggregates/patient-nutritionist-assignment.aggregate.js';
import { PatientNutritionistAssignmentId } from '../../domain/value-objects/patient-nutritionist-assignment-id.js';
import { PatientNutritionistAssignmentRole } from '../../domain/value-objects/patient-nutritionist-assignment-role.js';
import { PatientNutritionistAssignmentStatus } from '../../domain/value-objects/patient-nutritionist-assignment-status.js';
import { PatientId } from '../../domain/value-objects/patient-id.js';
import { TenantId } from '../../../iam/domain/value-objects/tenant-id.js';

export type PatientNutritionistAssignmentPersistenceInput = {
  id: string;
  tenantId: string;
  patientId: string;
  nutritionistId: string;
  role: PrismaRole;
  status: PrismaStatus;
  createdAt: Date;
  reactivatedAt: Date | null;
  removedAt: Date | null;
};

export function toPersistence(
  assignment: PatientNutritionistAssignment,
): PatientNutritionistAssignmentPersistenceInput {
  return {
    id: assignment.getId().toString(),
    tenantId: assignment.getTenantId().toString(),
    patientId: assignment.getPatientId().toString(),
    nutritionistId: assignment.getNutritionistId(),
    role: toPrismaRole(assignment.getRole()),
    status: toPrismaStatus(assignment.getStatus()),
    createdAt: assignment.getCreatedAt(),
    reactivatedAt: assignment.getReactivatedAt(),
    removedAt: assignment.getRemovedAt(),
  };
}

export function toDomain(
  record: AssignmentRecord,
): PatientNutritionistAssignment {
  return PatientNutritionistAssignment.reconstitute({
    id: PatientNutritionistAssignmentId.create(record.id),
    tenantId: TenantId.create(record.tenantId),
    patientId: PatientId.create(record.patientId),
    nutritionistId: record.nutritionistId,
    role: toDomainRole(record.role),
    status: toDomainStatus(record.status),
    createdAt: record.createdAt,
    reactivatedAt: record.reactivatedAt,
    removedAt: record.removedAt,
  });
}

function toPrismaRole(role: PatientNutritionistAssignmentRole): PrismaRole {
  return role.toString() as PrismaRole;
}

function toDomainRole(role: PrismaRole): PatientNutritionistAssignmentRole {
  return PatientNutritionistAssignmentRole.create(role);
}

function toPrismaStatus(
  status: PatientNutritionistAssignmentStatus,
): PrismaStatus {
  return status as PrismaStatus;
}

function toDomainStatus(status: PrismaStatus): PatientNutritionistAssignmentStatus {
  return status as PatientNutritionistAssignmentStatus;
}
