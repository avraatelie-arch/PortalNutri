import { AggregateRoot } from './aggregate-root.js';
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
import { Email } from '../../../iam/domain/value-objects/email.js';
import { FullName } from '../../../iam/domain/value-objects/full-name.js';
import { Phone } from '../../../iam/domain/value-objects/phone.js';
import { TenantId } from '../../../iam/domain/value-objects/tenant-id.js';

export interface CreatePatientProps {
  id?: PatientId;
  tenantId: TenantId;
  fullName: FullName;
  birthDate: BirthDate;
  gender: Gender;
  phone?: Phone | null;
  email?: Email | null;
}

export interface UpdatePatientProfileProps {
  fullName?: FullName;
  birthDate?: BirthDate;
  gender?: Gender;
  phone?: Phone | null;
  email?: Email | null;
}

export interface ReconstitutePatientProps {
  id: PatientId;
  tenantId: TenantId;
  fullName: FullName;
  birthDate: BirthDate;
  gender: Gender;
  phone: Phone | null;
  email: Email | null;
  status: PatientStatus;
  createdAt: Date;
  updatedAt: Date;
}

export class Patient extends AggregateRoot {
  private constructor(
    private readonly id: PatientId,
    private readonly tenantId: TenantId,
    private fullName: FullName,
    private birthDate: BirthDate,
    private gender: Gender,
    private phone: Phone | null,
    private email: Email | null,
    private status: PatientStatus,
    private readonly createdAt: Date,
    private updatedAt: Date,
  ) {
    super();
  }

  static create(props: CreatePatientProps): Patient {
    const id = props.id ?? PatientId.generate();
    const now = new Date();
    const phone = props.phone ?? null;
    const email = props.email ?? null;

    const patient = new Patient(
      id,
      props.tenantId,
      props.fullName,
      props.birthDate,
      props.gender,
      phone,
      email,
      PatientStatus.Active,
      now,
      now,
    );

    patient.addDomainEvent(
      new PatientCreated(
        id.toString(),
        props.tenantId.toString(),
        props.fullName.toString(),
        props.birthDate.toString(),
        props.gender.toString(),
        phone?.toString() ?? null,
        email?.toString() ?? null,
      ),
    );

    return patient;
  }

  static reconstitute(props: ReconstitutePatientProps): Patient {
    return new Patient(
      props.id,
      props.tenantId,
      props.fullName,
      props.birthDate,
      props.gender,
      props.phone,
      props.email,
      props.status,
      props.createdAt,
      props.updatedAt,
    );
  }

  updateProfile(props: UpdatePatientProfileProps): void {
    this.ensureActive();

    const changedFields: string[] = [];

    if (props.fullName && !props.fullName.equals(this.fullName)) {
      this.fullName = props.fullName;
      changedFields.push('fullName');
    }

    if (props.birthDate && !props.birthDate.equals(this.birthDate)) {
      this.birthDate = props.birthDate;
      changedFields.push('birthDate');
    }

    if (props.gender && !props.gender.equals(this.gender)) {
      this.gender = props.gender;
      changedFields.push('gender');
    }

    if (props.phone !== undefined && !this.hasSamePhone(props.phone)) {
      this.phone = props.phone;
      changedFields.push('phone');
    }

    if (props.email !== undefined && !this.hasSameEmail(props.email)) {
      this.email = props.email;
      changedFields.push('email');
    }

    if (changedFields.length === 0) {
      return;
    }

    this.updatedAt = new Date();
    this.addDomainEvent(
      new PatientProfileUpdated(this.id.toString(), changedFields),
    );
  }

  activate(): void {
    if (this.status === PatientStatus.Active) {
      return;
    }

    this.status = PatientStatus.Active;
    this.updatedAt = new Date();
    this.addDomainEvent(new PatientActivated(this.id.toString()));
  }

  deactivate(): void {
    if (this.status === PatientStatus.Inactive) {
      return;
    }

    this.status = PatientStatus.Inactive;
    this.updatedAt = new Date();
    this.addDomainEvent(new PatientDeactivated(this.id.toString()));
  }

  getId(): PatientId {
    return this.id;
  }

  getTenantId(): TenantId {
    return this.tenantId;
  }

  getFullName(): FullName {
    return this.fullName;
  }

  getBirthDate(): BirthDate {
    return this.birthDate;
  }

  getGender(): Gender {
    return this.gender;
  }

  getPhone(): Phone | null {
    return this.phone;
  }

  getEmail(): Email | null {
    return this.email;
  }

  getStatus(): PatientStatus {
    return this.status;
  }

  getCreatedAt(): Date {
    return new Date(this.createdAt);
  }

  getUpdatedAt(): Date {
    return new Date(this.updatedAt);
  }

  isActive(): boolean {
    return this.status === PatientStatus.Active;
  }

  private ensureActive(): void {
    if (!this.isActive()) {
      throw new DomainError('Inactive patients cannot update their profile.');
    }
  }

  private hasSamePhone(phone: Phone | null): boolean {
    if (this.phone === null && phone === null) {
      return true;
    }

    if (this.phone === null || phone === null) {
      return false;
    }

    return this.phone.equals(phone);
  }

  private hasSameEmail(email: Email | null): boolean {
    if (this.email === null && email === null) {
      return true;
    }

    if (this.email === null || email === null) {
      return false;
    }

    return this.email.equals(email);
  }
}
