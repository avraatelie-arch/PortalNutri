import type { Patient as PatientRecord } from '@prisma/client';
import { Gender as PrismaGender, PatientStatus as PrismaPatientStatus } from '@prisma/client';
import { Patient } from '../../domain/aggregates/patient.aggregate.js';
import { BirthDate } from '../../domain/value-objects/birth-date.js';
import { Gender } from '../../domain/value-objects/gender.js';
import { PatientId } from '../../domain/value-objects/patient-id.js';
import { PatientStatus } from '../../domain/value-objects/patient-status.js';
import { Email } from '../../../iam/domain/value-objects/email.js';
import { FullName } from '../../../iam/domain/value-objects/full-name.js';
import { Phone } from '../../../iam/domain/value-objects/phone.js';
import { TenantId } from '../../../iam/domain/value-objects/tenant-id.js';

export type PatientPersistenceInput = {
  id: string;
  tenantId: string;
  fullName: string;
  birthDate: Date;
  gender: PrismaGender;
  phone: string | null;
  email: string | null;
  status: PrismaPatientStatus;
  createdAt: Date;
  updatedAt: Date;
};

export function toPersistence(patient: Patient): PatientPersistenceInput {
  return {
    id: patient.getId().toString(),
    tenantId: patient.getTenantId().toString(),
    fullName: patient.getFullName().toString(),
    birthDate: patient.getBirthDate().toDate(),
    gender: toPrismaGender(patient.getGender()),
    phone: patient.getPhone()?.toString() ?? null,
    email: patient.getEmail()?.toString() ?? null,
    status: toPrismaPatientStatus(patient.getStatus()),
    createdAt: patient.getCreatedAt(),
    updatedAt: patient.getUpdatedAt(),
  };
}

export function toDomain(record: PatientRecord): Patient {
  return Patient.reconstitute({
    id: PatientId.create(record.id),
    tenantId: TenantId.create(record.tenantId),
    fullName: FullName.create(record.fullName),
    birthDate: BirthDate.create(toLocalDate(record.birthDate)),
    gender: toDomainGender(record.gender),
    phone: Phone.createOptional(record.phone),
    email: record.email ? Email.create(record.email) : null,
    status: toDomainPatientStatus(record.status),
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  });
}

function toLocalDate(value: Date): Date {
  return new Date(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate());
}

function toPrismaPatientStatus(status: PatientStatus): PrismaPatientStatus {
  return status as PrismaPatientStatus;
}

function toDomainPatientStatus(status: PrismaPatientStatus): PatientStatus {
  return status as PatientStatus;
}

function toPrismaGender(gender: Gender): PrismaGender {
  return gender.toString() as PrismaGender;
}

function toDomainGender(gender: PrismaGender): Gender {
  return Gender.create(gender);
}
