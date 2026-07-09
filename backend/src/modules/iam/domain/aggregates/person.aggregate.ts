import { AggregateRoot } from './aggregate-root.js';
import { DomainError } from '../errors/domain-error.js';
import {
  PersonActivated,
  PersonCreated,
  PersonDeactivated,
  PersonUpdated,
} from '../events/person-events.js';
import { BirthDate } from '../value-objects/birth-date.js';
import { Document } from '../value-objects/document.js';
import { Email } from '../value-objects/email.js';
import { FullName } from '../value-objects/full-name.js';
import { PersonId } from '../value-objects/person-id.js';
import { PersonStatus } from '../value-objects/person-status.js';
import { Phone } from '../value-objects/phone.js';

export interface CreatePersonProps {
  id?: PersonId;
  fullName: FullName;
  email: Email;
  document: Document;
  birthDate: BirthDate;
  phone?: Phone | null;
}

export interface UpdatePersonProps {
  fullName?: FullName;
  email?: Email;
  document?: Document;
  birthDate?: BirthDate;
  phone?: Phone | null;
}

export interface ReconstitutePersonProps {
  id: PersonId;
  fullName: FullName;
  email: Email;
  document: Document;
  birthDate: BirthDate;
  phone: Phone | null;
  status: PersonStatus;
  createdAt: Date;
  updatedAt: Date;
}

export class Person extends AggregateRoot {
  private constructor(
    private readonly id: PersonId,
    private fullName: FullName,
    private email: Email,
    private document: Document,
    private birthDate: BirthDate,
    private phone: Phone | null,
    private status: PersonStatus,
    private readonly createdAt: Date,
    private updatedAt: Date,
  ) {
    super();
  }

  static create(props: CreatePersonProps): Person {
    const id = props.id ?? PersonId.generate();
    const now = new Date();

    const person = new Person(
      id,
      props.fullName,
      props.email,
      props.document,
      props.birthDate,
      props.phone ?? null,
      PersonStatus.Active,
      now,
      now,
    );

    person.addDomainEvent(
      new PersonCreated(
        id.toString(),
        props.fullName.toString(),
        props.email.toString(),
        props.document.getType(),
        props.document.getValue(),
      ),
    );

    return person;
  }

  static reconstitute(props: ReconstitutePersonProps): Person {
    return new Person(
      props.id,
      props.fullName,
      props.email,
      props.document,
      props.birthDate,
      props.phone,
      props.status,
      props.createdAt,
      props.updatedAt,
    );
  }

  update(props: UpdatePersonProps): void {
    this.ensureActive();

    const changedFields: string[] = [];

    if (props.fullName && !props.fullName.equals(this.fullName)) {
      this.fullName = props.fullName;
      changedFields.push('fullName');
    }

    if (props.email && !props.email.equals(this.email)) {
      this.email = props.email;
      changedFields.push('email');
    }

    if (props.document && !props.document.equals(this.document)) {
      this.document = props.document;
      changedFields.push('document');
    }

    if (props.birthDate && !props.birthDate.equals(this.birthDate)) {
      this.birthDate = props.birthDate;
      changedFields.push('birthDate');
    }

    if (props.phone !== undefined && !this.hasSamePhone(props.phone)) {
      this.phone = props.phone;
      changedFields.push('phone');
    }

    if (changedFields.length === 0) {
      return;
    }

    this.updatedAt = new Date();
    this.addDomainEvent(new PersonUpdated(this.id.toString(), changedFields));
  }

  activate(): void {
    if (this.status === PersonStatus.Active) {
      return;
    }

    this.status = PersonStatus.Active;
    this.updatedAt = new Date();
    this.addDomainEvent(new PersonActivated(this.id.toString()));
  }

  deactivate(): void {
    if (this.status === PersonStatus.Inactive) {
      return;
    }

    this.status = PersonStatus.Inactive;
    this.updatedAt = new Date();
    this.addDomainEvent(new PersonDeactivated(this.id.toString()));
  }

  getId(): PersonId {
    return this.id;
  }

  getFullName(): FullName {
    return this.fullName;
  }

  getEmail(): Email {
    return this.email;
  }

  getDocument(): Document {
    return this.document;
  }

  getBirthDate(): BirthDate {
    return this.birthDate;
  }

  getPhone(): Phone | null {
    return this.phone;
  }

  getStatus(): PersonStatus {
    return this.status;
  }

  getCreatedAt(): Date {
    return new Date(this.createdAt);
  }

  getUpdatedAt(): Date {
    return new Date(this.updatedAt);
  }

  isActive(): boolean {
    return this.status === PersonStatus.Active;
  }

  private ensureActive(): void {
    if (!this.isActive()) {
      throw new DomainError('Inactive persons cannot be updated.');
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
}
