export { AggregateRoot } from './aggregates/aggregate-root.js';
export { Person } from './aggregates/person.aggregate.js';
export { Tenant } from './aggregates/tenant.aggregate.js';
export type {
  CreatePersonProps,
  ReconstitutePersonProps,
  UpdatePersonProps,
} from './aggregates/person.aggregate.js';
export type {
  CreateTenantProps,
  ReconstituteTenantProps,
} from './aggregates/tenant.aggregate.js';
export { DomainError } from './errors/domain-error.js';
export type { DomainEvent } from './events/domain-event.js';
export {
  PersonActivated,
  PersonCreated,
  PersonDeactivated,
  PersonUpdated,
} from './events/person-events.js';
export {
  TenantActivated,
  TenantCreated,
  TenantDeactivated,
} from './events/tenant-events.js';
export type { PersonRepository } from './repositories/person-repository.js';
export type { TenantRepository } from './repositories/tenant-repository.js';
export { BirthDate } from './value-objects/birth-date.js';
export { Document, DocumentType } from './value-objects/document.js';
export { Email } from './value-objects/email.js';
export { FullName } from './value-objects/full-name.js';
export { PersonId } from './value-objects/person-id.js';
export { PersonStatus } from './value-objects/person-status.js';
export { TenantId } from './value-objects/tenant-id.js';
export { TenantName } from './value-objects/tenant-name.js';
export { TenantSlug } from './value-objects/tenant-slug.js';
export { TenantStatus } from './value-objects/tenant-status.js';
export { Phone } from './value-objects/phone.js';
export { PreferredName } from './value-objects/preferred-name.js';
