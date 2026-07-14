import { AggregateRoot } from './aggregate-root.js';
import {
  RoleAssigned,
  RoleRemoved,
} from '../events/role-assignment-events.js';
import { MembershipId } from '../value-objects/membership-id.js';
import { RoleAssignmentId } from '../value-objects/role-assignment-id.js';
import { RoleAssignmentStatus } from '../value-objects/role-assignment-status.js';
import { RoleId } from '../value-objects/role-id.js';

export interface CreateRoleAssignmentProps {
  id?: RoleAssignmentId;
  membershipId: MembershipId;
  roleId: RoleId;
}

export interface ReconstituteRoleAssignmentProps {
  id: RoleAssignmentId;
  membershipId: MembershipId;
  roleId: RoleId;
  status: RoleAssignmentStatus;
  createdAt: Date;
  reactivatedAt: Date | null;
  removedAt: Date | null;
}

export class RoleAssignment extends AggregateRoot {
  private constructor(
    private readonly id: RoleAssignmentId,
    private readonly membershipId: MembershipId,
    private readonly roleId: RoleId,
    private status: RoleAssignmentStatus,
    private readonly createdAt: Date,
    private reactivatedAt: Date | null,
    private removedAt: Date | null,
  ) {
    super();
  }

  static create(
    props: CreateRoleAssignmentProps,
    tenantId: string,
  ): RoleAssignment {
    const id = props.id ?? RoleAssignmentId.generate();
    const now = new Date();

    const assignment = new RoleAssignment(
      id,
      props.membershipId,
      props.roleId,
      RoleAssignmentStatus.Active,
      now,
      null,
      null,
    );

    assignment.addDomainEvent(
      new RoleAssigned(
        id.toString(),
        props.membershipId.toString(),
        props.roleId.toString(),
        tenantId,
      ),
    );

    return assignment;
  }

  static reconstitute(props: ReconstituteRoleAssignmentProps): RoleAssignment {
    return new RoleAssignment(
      props.id,
      props.membershipId,
      props.roleId,
      props.status,
      props.createdAt,
      props.reactivatedAt,
      props.removedAt,
    );
  }

  reactivate(tenantId: string): void {
    if (this.status === RoleAssignmentStatus.Active) {
      return;
    }

    this.status = RoleAssignmentStatus.Active;
    this.reactivatedAt = new Date();
    this.removedAt = null;
    this.addDomainEvent(
      new RoleAssigned(
        this.id.toString(),
        this.membershipId.toString(),
        this.roleId.toString(),
        tenantId,
      ),
    );
  }

  remove(tenantId: string): void {
    if (this.status === RoleAssignmentStatus.Removed) {
      return;
    }

    this.status = RoleAssignmentStatus.Removed;
    this.removedAt = new Date();
    this.addDomainEvent(
      new RoleRemoved(
        this.id.toString(),
        this.membershipId.toString(),
        this.roleId.toString(),
        tenantId,
      ),
    );
  }

  getId(): RoleAssignmentId {
    return this.id;
  }

  getMembershipId(): MembershipId {
    return this.membershipId;
  }

  getRoleId(): RoleId {
    return this.roleId;
  }

  getStatus(): RoleAssignmentStatus {
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
    return this.status === RoleAssignmentStatus.Active;
  }

  isRemoved(): boolean {
    return this.status === RoleAssignmentStatus.Removed;
  }
}
