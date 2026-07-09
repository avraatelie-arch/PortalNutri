export { AggregateRoot } from './aggregates/aggregate-root.js';
export { Person } from './aggregates/person.aggregate.js';
export type {
  CreatePersonProps,
  ReconstitutePersonProps,
  UpdatePersonProps,
} from './aggregates/person.aggregate.js';
export { DomainError } from './errors/domain-error.js';
export type { DomainEvent } from './events/domain-event.js';
export {
  PersonActivated,
  PersonCreated,
  PersonDeactivated,
  PersonUpdated,
} from './events/person-events.js';
export type { PersonRepository } from './repositories/person-repository.js';
export { BirthDate } from './value-objects/birth-date.js';
export { Document, DocumentType } from './value-objects/document.js';
export { Email } from './value-objects/email.js';
export { FullName } from './value-objects/full-name.js';
export { PersonId } from './value-objects/person-id.js';
export { PersonStatus } from './value-objects/person-status.js';
export { Phone } from './value-objects/phone.js';
