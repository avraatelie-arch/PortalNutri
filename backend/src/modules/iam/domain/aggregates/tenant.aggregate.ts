import { AggregateRoot } from './aggregate-root.js';
import {
  TenantActivated,
  TenantCreated,
  TenantDeactivated,
} from '../events/tenant-events.js';
import { TenantId } from '../value-objects/tenant-id.js';
import { TenantName } from '../value-objects/tenant-name.js';
import { TenantSlug } from '../value-objects/tenant-slug.js';
import { TenantStatus } from '../value-objects/tenant-status.js';

export interface CreateTenantProps {
  id?: TenantId;
  name: TenantName;
  slug: TenantSlug;
}

export interface ReconstituteTenantProps {
  id: TenantId;
  name: TenantName;
  slug: TenantSlug;
  status: TenantStatus;
  createdAt: Date;
  updatedAt: Date;
}

export class Tenant extends AggregateRoot {
  private constructor(
    private readonly id: TenantId,
    private readonly name: TenantName,
    private readonly slug: TenantSlug,
    private status: TenantStatus,
    private readonly createdAt: Date,
    private updatedAt: Date,
  ) {
    super();
  }

  static create(props: CreateTenantProps): Tenant {
    const id = props.id ?? TenantId.generate();
    const now = new Date();

    const tenant = new Tenant(
      id,
      props.name,
      props.slug,
      TenantStatus.Active,
      now,
      now,
    );

    tenant.addDomainEvent(
      new TenantCreated(
        id.toString(),
        props.name.toString(),
        props.slug.toString(),
      ),
    );

    return tenant;
  }

  static reconstitute(props: ReconstituteTenantProps): Tenant {
    return new Tenant(
      props.id,
      props.name,
      props.slug,
      props.status,
      props.createdAt,
      props.updatedAt,
    );
  }

  activate(): void {
    if (this.status === TenantStatus.Active) {
      return;
    }

    this.status = TenantStatus.Active;
    this.updatedAt = new Date();
    this.addDomainEvent(new TenantActivated(this.id.toString()));
  }

  deactivate(): void {
    if (this.status === TenantStatus.Inactive) {
      return;
    }

    this.status = TenantStatus.Inactive;
    this.updatedAt = new Date();
    this.addDomainEvent(new TenantDeactivated(this.id.toString()));
  }

  getId(): TenantId {
    return this.id;
  }

  getName(): TenantName {
    return this.name;
  }

  getSlug(): TenantSlug {
    return this.slug;
  }

  getStatus(): TenantStatus {
    return this.status;
  }

  getCreatedAt(): Date {
    return new Date(this.createdAt);
  }

  getUpdatedAt(): Date {
    return new Date(this.updatedAt);
  }

  isActive(): boolean {
    return this.status === TenantStatus.Active;
  }
}
