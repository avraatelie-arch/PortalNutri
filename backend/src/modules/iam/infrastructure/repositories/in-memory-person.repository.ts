import type { Person } from '../../domain/aggregates/person.aggregate.js';
import type { PersonRepository } from '../../domain/repositories/person-repository.js';
import type { Document } from '../../domain/value-objects/document.js';
import type { Email } from '../../domain/value-objects/email.js';
import type { PersonId } from '../../domain/value-objects/person-id.js';

export class InMemoryPersonRepository implements PersonRepository {
  private readonly persons = new Map<string, Person>();

  async save(person: Person): Promise<void> {
    this.persons.set(person.getId().toString(), person);
  }

  async findById(id: PersonId): Promise<Person | null> {
    return this.persons.get(id.toString()) ?? null;
  }

  async findByEmail(email: Email): Promise<Person | null> {
    for (const person of this.persons.values()) {
      if (person.getEmail().equals(email)) {
        return person;
      }
    }

    return null;
  }

  async findByDocument(document: Document): Promise<Person | null> {
    for (const person of this.persons.values()) {
      if (person.getDocument().equals(document)) {
        return person;
      }
    }

    return null;
  }

  async existsByEmail(email: Email): Promise<boolean> {
    return (await this.findByEmail(email)) !== null;
  }

  async existsByDocument(document: Document): Promise<boolean> {
    return (await this.findByDocument(document)) !== null;
  }
}
