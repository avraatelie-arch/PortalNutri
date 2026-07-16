import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { Email } from '../../../iam/domain/value-objects/email.js';
import { FullName } from '../../../iam/domain/value-objects/full-name.js';
import { Phone } from '../../../iam/domain/value-objects/phone.js';
import { TenantId } from '../../../iam/domain/value-objects/tenant-id.js';
import { DomainError } from '../errors/domain-error.js';
import {
  PatientActivated,
  PatientCreated,
  PatientDeactivated,
  PatientProfileUpdated,
} from '../events/patient-events.js';
import { BirthDate } from '../value-objects/birth-date.js';
import { Gender } from '../value-objects/gender.js';
import { PatientId } from '../value-objects/patient-id.js';
import { PatientStatus } from '../value-objects/patient-status.js';
import { Patient } from './patient.aggregate.js';

const PATIENT_ID = PatientId.create('550e8400-e29b-41d4-a716-446655440020');
const TENANT_ID = TenantId.create('550e8400-e29b-41d4-a716-446655440001');

function createValidBirthDate(): BirthDate {
  return BirthDate.create(new Date(1990, 5, 15));
}

function createValidPatientProps() {
  return {
    id: PATIENT_ID,
    tenantId: TENANT_ID,
    fullName: FullName.create('Maria Silva Santos'),
    birthDate: createValidBirthDate(),
    gender: Gender.create('FEMALE'),
    phone: Phone.create('11987654321'),
    email: Email.create('maria.silva@example.com'),
  };
}

describe('Patient aggregate', () => {
  it('creates a valid patient', () => {
    const patient = Patient.create(createValidPatientProps());

    assert.equal(patient.getId().toString(), PATIENT_ID.toString());
    assert.equal(patient.getTenantId().toString(), TENANT_ID.toString());
    assert.equal(patient.getFullName().toString(), 'Maria Silva Santos');
    assert.equal(patient.getBirthDate().toString(), '1990-06-15');
    assert.equal(patient.getGender().toString(), 'FEMALE');
    assert.equal(patient.getPhone()?.toString(), '11987654321');
    assert.equal(patient.getEmail()?.toString(), 'maria.silva@example.com');
  });

  it('creates a patient without optional phone and email', () => {
    const patient = Patient.create({
      ...createValidPatientProps(),
      phone: null,
      email: null,
    });

    assert.equal(patient.getPhone(), null);
    assert.equal(patient.getEmail(), null);
  });

  it('starts with Active status', () => {
    const patient = Patient.create(createValidPatientProps());

    assert.equal(patient.getStatus(), PatientStatus.Active);
    assert.equal(patient.isActive(), true);
  });

  it('publishes PatientCreated on creation', () => {
    const patient = Patient.create(createValidPatientProps());
    const event = patient.domainEvents[0] as PatientCreated;

    assert.equal(patient.domainEvents.length, 1);
    assert.ok(event instanceof PatientCreated);
    assert.equal(event.eventName, 'PatientCreated');
    assert.equal(event.aggregateId, PATIENT_ID.toString());
    assert.equal(event.tenantId, TENANT_ID.toString());
    assert.equal(event.fullName, 'Maria Silva Santos');
    assert.equal(event.birthDate, '1990-06-15');
    assert.equal(event.gender, 'FEMALE');
    assert.equal(event.phone, '11987654321');
    assert.equal(event.email, 'maria.silva@example.com');
  });

  it('publishes PatientDeactivated on deactivate', () => {
    const patient = Patient.create(createValidPatientProps());
    patient.clearDomainEvents();

    patient.deactivate();

    assert.equal(patient.getStatus(), PatientStatus.Inactive);
    assert.equal(patient.domainEvents.length, 1);
    assert.ok(patient.domainEvents[0] instanceof PatientDeactivated);
    assert.equal(patient.domainEvents[0].eventName, 'PatientDeactivated');
  });

  it('publishes PatientActivated on activate', () => {
    const patient = Patient.create(createValidPatientProps());
    patient.deactivate();
    patient.clearDomainEvents();

    patient.activate();

    assert.equal(patient.getStatus(), PatientStatus.Active);
    assert.equal(patient.domainEvents.length, 1);
    assert.ok(patient.domainEvents[0] instanceof PatientActivated);
    assert.equal(patient.domainEvents[0].eventName, 'PatientActivated');
  });

  it('deactivate is idempotent', () => {
    const patient = Patient.create(createValidPatientProps());
    patient.deactivate();
    patient.clearDomainEvents();

    patient.deactivate();

    assert.equal(patient.domainEvents.length, 0);
    assert.equal(patient.getStatus(), PatientStatus.Inactive);
  });

  it('activate is idempotent', () => {
    const patient = Patient.create(createValidPatientProps());
    patient.clearDomainEvents();

    patient.activate();

    assert.equal(patient.domainEvents.length, 0);
    assert.equal(patient.getStatus(), PatientStatus.Active);
  });

  it('publishes PatientProfileUpdated on profile update', () => {
    const patient = Patient.create(createValidPatientProps());
    patient.clearDomainEvents();

    patient.updateProfile({
      fullName: FullName.create('Maria Silva Oliveira'),
      birthDate: BirthDate.create(new Date(1991, 0, 10)),
      gender: Gender.create('OTHER'),
      phone: Phone.create('21999887766'),
      email: Email.create('maria.oliveira@example.com'),
    });

    assert.equal(patient.getFullName().toString(), 'Maria Silva Oliveira');
    assert.equal(patient.getBirthDate().toString(), '1991-01-10');
    assert.equal(patient.getGender().toString(), 'OTHER');
    assert.equal(patient.getPhone()?.toString(), '21999887766');
    assert.equal(patient.getEmail()?.toString(), 'maria.oliveira@example.com');
    assert.equal(patient.domainEvents.length, 1);
    assert.ok(patient.domainEvents[0] instanceof PatientProfileUpdated);
    assert.deepEqual(
      (patient.domainEvents[0] as PatientProfileUpdated).changedFields,
      ['fullName', 'birthDate', 'gender', 'phone', 'email'],
    );
  });

  it('clears phone and email when set to null', () => {
    const patient = Patient.create(createValidPatientProps());
    patient.clearDomainEvents();

    patient.updateProfile({ phone: null, email: null });

    assert.equal(patient.getPhone(), null);
    assert.equal(patient.getEmail(), null);
    assert.deepEqual(
      (patient.domainEvents[0] as PatientProfileUpdated).changedFields,
      ['phone', 'email'],
    );
  });

  it('does not publish events when profile update has no changes', () => {
    const patient = Patient.create(createValidPatientProps());
    patient.clearDomainEvents();

    patient.updateProfile({
      fullName: FullName.create('Maria Silva Santos'),
      birthDate: createValidBirthDate(),
      gender: Gender.create('FEMALE'),
      phone: Phone.create('11987654321'),
      email: Email.create('maria.silva@example.com'),
    });

    assert.equal(patient.domainEvents.length, 0);
  });

  it('does not allow updating an inactive patient profile', () => {
    const patient = Patient.create(createValidPatientProps());
    patient.deactivate();

    assert.throws(
      () =>
        patient.updateProfile({
          fullName: FullName.create('Another Name Here'),
        }),
      DomainError,
    );
  });

  it('pullDomainEvents returns and clears pending events', () => {
    const patient = Patient.create(createValidPatientProps());

    const events = patient.pullDomainEvents();

    assert.equal(events.length, 1);
    assert.ok(events[0] instanceof PatientCreated);
    assert.equal(patient.domainEvents.length, 0);
  });
});

describe('PatientId', () => {
  it('accepts valid UUID values', () => {
    assert.equal(
      PatientId.create('550e8400-e29b-41d4-a716-446655440020').toString(),
      '550e8400-e29b-41d4-a716-446655440020',
    );
  });

  it('rejects invalid UUID values', () => {
    assert.throws(
      () => PatientId.create('not-a-uuid'),
      /PatientId must be a valid UUID/,
    );
  });

  it('rejects empty values', () => {
    assert.throws(() => PatientId.create('   '), /PatientId is required/);
  });
});

describe('BirthDate', () => {
  it('accepts valid past dates', () => {
    assert.equal(
      BirthDate.create(new Date(1985, 11, 25)).toString(),
      '1985-12-25',
    );
  });

  it('rejects future dates', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    assert.throws(
      () => BirthDate.create(tomorrow),
      /BirthDate cannot be in the future/,
    );
  });

  it('rejects invalid dates', () => {
    assert.throws(
      () => BirthDate.create(new Date('invalid')),
      /BirthDate must be a valid date/,
    );
  });

  it('rejects dates out of allowed range', () => {
    const tooOld = new Date();
    tooOld.setFullYear(tooOld.getFullYear() - 131);

    assert.throws(
      () => BirthDate.create(tooOld),
      /BirthDate is out of the allowed range/,
    );
  });
});

describe('Gender', () => {
  it('accepts valid gender values', () => {
    assert.equal(Gender.create('male').toString(), 'MALE');
    assert.equal(Gender.create('FEMALE').toString(), 'FEMALE');
    assert.equal(Gender.create('other').toString(), 'OTHER');
    assert.equal(Gender.create('NOT_INFORMED').toString(), 'NOT_INFORMED');
  });

  it('rejects invalid gender values', () => {
    assert.throws(
      () => Gender.create('UNKNOWN'),
      /Gender must be a valid value/,
    );
  });

  it('rejects empty values', () => {
    assert.throws(() => Gender.create('   '), /Gender is required/);
  });
});
