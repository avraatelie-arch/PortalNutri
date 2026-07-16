import { AggregateRoot } from './aggregate-root.js';
import { DomainError } from '../errors/domain-error.js';
import {
  NutritionistActivated,
  NutritionistCreated,
  NutritionistDeactivated,
  NutritionistProfileUpdated,
} from '../events/nutritionist-events.js';
import { Crn } from '../value-objects/crn.js';
import { NutritionistId } from '../value-objects/nutritionist-id.js';
import { NutritionistStatus } from '../value-objects/nutritionist-status.js';
import { Specialty } from '../value-objects/specialty.js';
import { StateCode } from '../value-objects/state-code.js';
import { PersonId } from '../../../iam/domain/value-objects/person-id.js';
import { TenantId } from '../../../iam/domain/value-objects/tenant-id.js';

export interface CreateNutritionistProps {
  id?: NutritionistId;
  personId: PersonId;
  tenantId: TenantId;
  crn: Crn;
  stateCode: StateCode;
  specialty: Specialty;
  bio?: string | null;
}

export interface UpdateNutritionistProfileProps {
  specialty?: Specialty;
  bio?: string | null;
}

export interface ReconstituteNutritionistProps {
  id: NutritionistId;
  personId: PersonId;
  tenantId: TenantId;
  crn: Crn;
  stateCode: StateCode;
  specialty: Specialty;
  bio: string | null;
  status: NutritionistStatus;
  createdAt: Date;
  updatedAt: Date;
}

function normalizeBio(bio: string | null | undefined): string | null {
  if (bio === undefined || bio === null) {
    return null;
  }

  const trimmed = bio.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export class Nutritionist extends AggregateRoot {
  private constructor(
    private readonly id: NutritionistId,
    private readonly personId: PersonId,
    private readonly tenantId: TenantId,
    private readonly crn: Crn,
    private readonly stateCode: StateCode,
    private specialty: Specialty,
    private bio: string | null,
    private status: NutritionistStatus,
    private readonly createdAt: Date,
    private updatedAt: Date,
  ) {
    super();
  }

  static create(props: CreateNutritionistProps): Nutritionist {
    const id = props.id ?? NutritionistId.generate();
    const now = new Date();
    const bio = normalizeBio(props.bio);

    const nutritionist = new Nutritionist(
      id,
      props.personId,
      props.tenantId,
      props.crn,
      props.stateCode,
      props.specialty,
      bio,
      NutritionistStatus.Active,
      now,
      now,
    );

    nutritionist.addDomainEvent(
      new NutritionistCreated(
        id.toString(),
        props.personId.toString(),
        props.tenantId.toString(),
        props.crn.toString(),
        props.stateCode.toString(),
        props.specialty.toString(),
        bio,
      ),
    );

    return nutritionist;
  }

  static reconstitute(props: ReconstituteNutritionistProps): Nutritionist {
    return new Nutritionist(
      props.id,
      props.personId,
      props.tenantId,
      props.crn,
      props.stateCode,
      props.specialty,
      props.bio,
      props.status,
      props.createdAt,
      props.updatedAt,
    );
  }

  updateProfile(props: UpdateNutritionistProfileProps): void {
    this.ensureActive();

    const changedFields: string[] = [];

    if (props.specialty && !props.specialty.equals(this.specialty)) {
      this.specialty = props.specialty;
      changedFields.push('specialty');
    }

    if (props.bio !== undefined && !this.hasSameBio(props.bio)) {
      this.bio = normalizeBio(props.bio);
      changedFields.push('bio');
    }

    if (changedFields.length === 0) {
      return;
    }

    this.updatedAt = new Date();
    this.addDomainEvent(
      new NutritionistProfileUpdated(this.id.toString(), changedFields),
    );
  }

  activate(): void {
    if (this.status === NutritionistStatus.Active) {
      return;
    }

    this.status = NutritionistStatus.Active;
    this.updatedAt = new Date();
    this.addDomainEvent(new NutritionistActivated(this.id.toString()));
  }

  deactivate(): void {
    if (this.status === NutritionistStatus.Inactive) {
      return;
    }

    this.status = NutritionistStatus.Inactive;
    this.updatedAt = new Date();
    this.addDomainEvent(new NutritionistDeactivated(this.id.toString()));
  }

  getId(): NutritionistId {
    return this.id;
  }

  getPersonId(): PersonId {
    return this.personId;
  }

  getTenantId(): TenantId {
    return this.tenantId;
  }

  getCrn(): Crn {
    return this.crn;
  }

  getStateCode(): StateCode {
    return this.stateCode;
  }

  getSpecialty(): Specialty {
    return this.specialty;
  }

  getBio(): string | null {
    return this.bio;
  }

  getStatus(): NutritionistStatus {
    return this.status;
  }

  getCreatedAt(): Date {
    return new Date(this.createdAt);
  }

  getUpdatedAt(): Date {
    return new Date(this.updatedAt);
  }

  isActive(): boolean {
    return this.status === NutritionistStatus.Active;
  }

  private ensureActive(): void {
    if (!this.isActive()) {
      throw new DomainError('Inactive nutritionists cannot update their profile.');
    }
  }

  private hasSameBio(bio: string | null): boolean {
    return normalizeBio(bio) === this.bio;
  }
}
