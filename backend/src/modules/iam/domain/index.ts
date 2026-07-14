export { AggregateRoot } from './aggregates/aggregate-root.js';
export { Membership } from './aggregates/membership.aggregate.js';
export { Person } from './aggregates/person.aggregate.js';
export { Role } from './aggregates/role.aggregate.js';
export { RoleAssignment } from './aggregates/role-assignment.aggregate.js';
export { Tenant } from './aggregates/tenant.aggregate.js';
export type {
  CreateMembershipProps,
  ReconstituteMembershipProps,
} from './aggregates/membership.aggregate.js';
export type {
  CreateRoleProps,
  ReconstituteRoleProps,
} from './aggregates/role.aggregate.js';
export type {
  CreateRoleAssignmentProps,
  ReconstituteRoleAssignmentProps,
} from './aggregates/role-assignment.aggregate.js';
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
  MembershipCreated,
  MembershipReactivated,
  MembershipRemoved,
} from './events/membership-events.js';
export {
  RoleAssigned,
  RoleRemoved,
} from './events/role-assignment-events.js';
export { RoleCreated } from './events/role-events.js';
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
export type { MembershipRepository } from './repositories/membership-repository.js';
export type { PersonRepository } from './repositories/person-repository.js';
export type { RoleAssignmentRepository } from './repositories/role-assignment-repository.js';
export type { RoleRepository } from './repositories/role-repository.js';
export type { TenantRepository } from './repositories/tenant-repository.js';
export { BirthDate } from './value-objects/birth-date.js';
export { Document, DocumentType } from './value-objects/document.js';
export { Email } from './value-objects/email.js';
export { FullName } from './value-objects/full-name.js';
export { MembershipId } from './value-objects/membership-id.js';
export { MembershipStatus } from './value-objects/membership-status.js';
export { RoleAssignmentId } from './value-objects/role-assignment-id.js';
export { RoleAssignmentStatus } from './value-objects/role-assignment-status.js';
export { RoleId } from './value-objects/role-id.js';
export { RoleName } from './value-objects/role-name.js';
export { PersonId } from './value-objects/person-id.js';
export { PersonStatus } from './value-objects/person-status.js';
export { TenantId } from './value-objects/tenant-id.js';
export { TenantName } from './value-objects/tenant-name.js';
export { TenantSlug } from './value-objects/tenant-slug.js';
export { TenantStatus } from './value-objects/tenant-status.js';
export { Phone } from './value-objects/phone.js';
export { PreferredName } from './value-objects/preferred-name.js';
