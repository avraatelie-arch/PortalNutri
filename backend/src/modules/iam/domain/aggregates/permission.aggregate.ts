import { AggregateRoot } from './aggregate-root.js';
import { PermissionCreated } from '../events/permission-events.js';
import { PermissionId } from '../value-objects/permission-id.js';
import { PermissionName } from '../value-objects/permission-name.js';
import { TenantId } from '../value-objects/tenant-id.js';

export interface CreatePermissionProps {
  id?: PermissionId;
  tenantId: TenantId;
  name: PermissionName;
}

export interface ReconstitutePermissionProps {
  id: PermissionId;
  tenantId: TenantId;
  name: PermissionName;
  createdAt: Date;
}

export class Permission extends AggregateRoot {
  private constructor(
    private readonly id: PermissionId,
    private readonly tenantId: TenantId,
    private readonly name: PermissionName,
    private readonly createdAt: Date,
  ) {
    super();
  }

  static create(props: CreatePermissionProps): Permission {
    const id = props.id ?? PermissionId.generate();
    const now = new Date();

    const permission = new Permission(id, props.tenantId, props.name, now);

    permission.addDomainEvent(
      new PermissionCreated(
        id.toString(),
        props.tenantId.toString(),
        props.name.toString(),
      ),
    );

    return permission;
  }

  static reconstitute(props: ReconstitutePermissionProps): Permission {
    return new Permission(
      props.id,
      props.tenantId,
      props.name,
      props.createdAt,
    );
  }

  getId(): PermissionId {
    return this.id;
  }

  getTenantId(): TenantId {
    return this.tenantId;
  }

  getName(): PermissionName {
    return this.name;
  }

  getCreatedAt(): Date {
    return new Date(this.createdAt);
  }
}
