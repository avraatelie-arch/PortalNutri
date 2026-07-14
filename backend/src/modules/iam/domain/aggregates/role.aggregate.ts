import { AggregateRoot } from './aggregate-root.js';
import { RoleCreated } from '../events/role-events.js';
import { RoleId } from '../value-objects/role-id.js';
import { RoleName } from '../value-objects/role-name.js';
import { TenantId } from '../value-objects/tenant-id.js';

export interface CreateRoleProps {
  id?: RoleId;
  tenantId: TenantId;
  name: RoleName;
}

export interface ReconstituteRoleProps {
  id: RoleId;
  tenantId: TenantId;
  name: RoleName;
  createdAt: Date;
}

export class Role extends AggregateRoot {
  private constructor(
    private readonly id: RoleId,
    private readonly tenantId: TenantId,
    private readonly name: RoleName,
    private readonly createdAt: Date,
  ) {
    super();
  }

  static create(props: CreateRoleProps): Role {
    const id = props.id ?? RoleId.generate();
    const now = new Date();

    const role = new Role(id, props.tenantId, props.name, now);

    role.addDomainEvent(
      new RoleCreated(
        id.toString(),
        props.tenantId.toString(),
        props.name.toString(),
      ),
    );

    return role;
  }

  static reconstitute(props: ReconstituteRoleProps): Role {
    return new Role(props.id, props.tenantId, props.name, props.createdAt);
  }

  getId(): RoleId {
    return this.id;
  }

  getTenantId(): TenantId {
    return this.tenantId;
  }

  getName(): RoleName {
    return this.name;
  }

  getCreatedAt(): Date {
    return new Date(this.createdAt);
  }
}
