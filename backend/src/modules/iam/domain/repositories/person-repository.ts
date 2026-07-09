import type { Person } from '../aggregates/person.aggregate.js';
import type { Document } from '../value-objects/document.js';
import type { Email } from '../value-objects/email.js';
import type { PersonId } from '../value-objects/person-id.js';

export interface PersonRepository {
  save(person: Person): Promise<void>;
  findById(id: PersonId): Promise<Person | null>;
  findByEmail(email: Email): Promise<Person | null>;
  findByDocument(document: Document): Promise<Person | null>;
  existsByEmail(email: Email): Promise<boolean>;
  existsByDocument(document: Document): Promise<boolean>;
}
