import { AggregateRoot } from './aggregate-root.js';
import {
  PermissionGranted,
  PermissionRevoked,
} from '../events/permission-assignment-events.js';
import { PermissionAssignmentId } from '../value-objects/permission-assignment-id.js';
import { PermissionAssignmentStatus } from '../value-objects/permission-assignment-status.js';
import { PermissionId } from '../value-objects/permission-id.js';
import { RoleId } from '../value-objects/role-id.js';

export interface CreatePermissionAssignmentProps {
  id?: PermissionAssignmentId;
  roleId: RoleId;
  permissionId: PermissionId;
}

export interface ReconstitutePermissionAssignmentProps {
  id: PermissionAssignmentId;
  roleId: RoleId;
  permissionId: PermissionId;
  status: PermissionAssignmentStatus;
  createdAt: Date;
  reactivatedAt: Date | null;
  removedAt: Date | null;
}

export class PermissionAssignment extends AggregateRoot {
  private constructor(
    private readonly id: PermissionAssignmentId,
    private readonly roleId: RoleId,
    private readonly permissionId: PermissionId,
    private status: PermissionAssignmentStatus,
    private readonly createdAt: Date,
    private reactivatedAt: Date | null,
    private removedAt: Date | null,
  ) {
    super();
  }

  static create(
    props: CreatePermissionAssignmentProps,
    tenantId: string,
  ): PermissionAssignment {
    const id = props.id ?? PermissionAssignmentId.generate();
    const now = new Date();

    const assignment = new PermissionAssignment(
      id,
      props.roleId,
      props.permissionId,
      PermissionAssignmentStatus.Active,
      now,
      null,
      null,
    );

    assignment.addDomainEvent(
      new PermissionGranted(
        id.toString(),
        props.roleId.toString(),
        props.permissionId.toString(),
        tenantId,
      ),
    );

    return assignment;
  }

  static reconstitute(
    props: ReconstitutePermissionAssignmentProps,
  ): PermissionAssignment {
    return new PermissionAssignment(
      props.id,
      props.roleId,
      props.permissionId,
      props.status,
      props.createdAt,
      props.reactivatedAt,
      props.removedAt,
    );
  }

  reactivate(tenantId: string): void {
    if (this.status === PermissionAssignmentStatus.Active) {
      return;
    }

    this.status = PermissionAssignmentStatus.Active;
    this.reactivatedAt = new Date();
    this.removedAt = null;
    this.addDomainEvent(
      new PermissionGranted(
        this.id.toString(),
        this.roleId.toString(),
        this.permissionId.toString(),
        tenantId,
      ),
    );
  }

  remove(tenantId: string): void {
    if (this.status === PermissionAssignmentStatus.Removed) {
      return;
    }

    this.status = PermissionAssignmentStatus.Removed;
    this.removedAt = new Date();
    this.addDomainEvent(
      new PermissionRevoked(
        this.id.toString(),
        this.roleId.toString(),
        this.permissionId.toString(),
        tenantId,
      ),
    );
  }

  getId(): PermissionAssignmentId {
    return this.id;
  }

  getRoleId(): RoleId {
    return this.roleId;
  }

  getPermissionId(): PermissionId {
    return this.permissionId;
  }

  getStatus(): PermissionAssignmentStatus {
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
    return this.status === PermissionAssignmentStatus.Active;
  }

  isRemoved(): boolean {
    return this.status === PermissionAssignmentStatus.Removed;
  }
}
