import { AggregateRoot } from './aggregate-root.js';
import { DomainError } from '../errors/domain-error.js';
import { PasswordChanged } from '../events/credential-events.js';
import { CredentialId } from '../value-objects/credential-id.js';
import { CredentialStatus } from '../value-objects/credential-status.js';
import { PasswordHash } from '../value-objects/password-hash.js';
import { PersonId } from '../value-objects/person-id.js';

export interface CreateCredentialProps {
  id?: CredentialId;
  personId: PersonId;
  passwordHash: PasswordHash;
}

export interface ReconstituteCredentialProps {
  id: CredentialId;
  personId: PersonId;
  passwordHash: PasswordHash;
  status: CredentialStatus;
  createdAt: Date;
  updatedAt: Date;
}

export class Credential extends AggregateRoot {
  private constructor(
    private readonly id: CredentialId,
    private readonly personId: PersonId,
    private passwordHash: PasswordHash,
    private status: CredentialStatus,
    private readonly createdAt: Date,
    private updatedAt: Date,
  ) {
    super();
  }

  static create(props: CreateCredentialProps): Credential {
    const now = new Date();

    return new Credential(
      props.id ?? CredentialId.generate(),
      props.personId,
      props.passwordHash,
      CredentialStatus.Active,
      now,
      now,
    );
  }

  static reconstitute(props: ReconstituteCredentialProps): Credential {
    return new Credential(
      props.id,
      props.personId,
      props.passwordHash,
      props.status,
      props.createdAt,
      props.updatedAt,
    );
  }

  getId(): CredentialId {
    return this.id;
  }

  getPersonId(): PersonId {
    return this.personId;
  }

  getPasswordHash(): PasswordHash {
    return this.passwordHash;
  }

  getStatus(): CredentialStatus {
    return this.status;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  isActive(): boolean {
    return this.status === CredentialStatus.Active;
  }

  changePassword(passwordHash: PasswordHash): void {
    this.assertCanAuthenticate();

    if (this.passwordHash.equals(passwordHash)) {
      return;
    }

    this.passwordHash = passwordHash;
    this.touch();
    this.addDomainEvent(new PasswordChanged(this.id.toString()));
  }

  lock(): void {
    if (this.status !== CredentialStatus.Active) {
      throw new DomainError('Only active credentials can be locked.');
    }

    this.status = CredentialStatus.Locked;
    this.touch();
  }

  unlock(): void {
    if (this.status !== CredentialStatus.Locked) {
      throw new DomainError('Only locked credentials can be unlocked.');
    }

    this.status = CredentialStatus.Active;
    this.touch();
  }

  disable(): void {
    if (
      this.status !== CredentialStatus.Active &&
      this.status !== CredentialStatus.Locked
    ) {
      throw new DomainError('Only active or locked credentials can be disabled.');
    }

    this.status = CredentialStatus.Disabled;
    this.touch();
  }

  private assertCanAuthenticate(): void {
    if (this.status !== CredentialStatus.Active) {
      throw new DomainError('Credential is not active.');
    }
  }

  private touch(): void {
    this.updatedAt = new Date();
  }
}
