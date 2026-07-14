import { AggregateRoot } from './aggregate-root.js';
import {
  MembershipCreated,
  MembershipReactivated,
  MembershipRemoved,
} from '../events/membership-events.js';
import { MembershipId } from '../value-objects/membership-id.js';
import { MembershipStatus } from '../value-objects/membership-status.js';
import { PersonId } from '../value-objects/person-id.js';
import { TenantId } from '../value-objects/tenant-id.js';

export interface CreateMembershipProps {
  id?: MembershipId;
  personId: PersonId;
  tenantId: TenantId;
}

export interface ReconstituteMembershipProps {
  id: MembershipId;
  personId: PersonId;
  tenantId: TenantId;
  status: MembershipStatus;
  createdAt: Date;
  reactivatedAt: Date | null;
  removedAt: Date | null;
}

export class Membership extends AggregateRoot {
  private constructor(
    private readonly id: MembershipId,
    private readonly personId: PersonId,
    private readonly tenantId: TenantId,
    private status: MembershipStatus,
    private readonly createdAt: Date,
    private reactivatedAt: Date | null,
    private removedAt: Date | null,
  ) {
    super();
  }

  static create(props: CreateMembershipProps): Membership {
    const id = props.id ?? MembershipId.generate();
    const now = new Date();

    const membership = new Membership(
      id,
      props.personId,
      props.tenantId,
      MembershipStatus.Active,
      now,
      null,
      null,
    );

    membership.addDomainEvent(
      new MembershipCreated(
        id.toString(),
        props.personId.toString(),
        props.tenantId.toString(),
      ),
    );

    return membership;
  }

  static reconstitute(props: ReconstituteMembershipProps): Membership {
    return new Membership(
      props.id,
      props.personId,
      props.tenantId,
      props.status,
      props.createdAt,
      props.reactivatedAt,
      props.removedAt,
    );
  }

  reactivate(): void {
    if (this.status === MembershipStatus.Active) {
      return;
    }

    this.status = MembershipStatus.Active;
    this.reactivatedAt = new Date();
    this.removedAt = null;
    this.addDomainEvent(
      new MembershipReactivated(
        this.id.toString(),
        this.personId.toString(),
        this.tenantId.toString(),
      ),
    );
  }

  remove(): void {
    if (this.status === MembershipStatus.Removed) {
      return;
    }

    this.status = MembershipStatus.Removed;
    this.removedAt = new Date();
    this.addDomainEvent(
      new MembershipRemoved(
        this.id.toString(),
        this.personId.toString(),
        this.tenantId.toString(),
      ),
    );
  }

  getId(): MembershipId {
    return this.id;
  }

  getPersonId(): PersonId {
    return this.personId;
  }

  getTenantId(): TenantId {
    return this.tenantId;
  }

  getStatus(): MembershipStatus {
    return this.status;
  }

  getCreatedAt(): Date {
    return new Date(this.createdAt);
  }

  getReactivatedAt(): Date | null {
    return this.reactivatedAt ? new Date(this.reactivatedAt) : null;
  }

  getRemovedAt(): Date | null {
    return this.removedAt ? new Date(this.removedAt) : null;
  }

  isActive(): boolean {
    return this.status === MembershipStatus.Active;
  }

  isRemoved(): boolean {
    return this.status === MembershipStatus.Removed;
  }
}
