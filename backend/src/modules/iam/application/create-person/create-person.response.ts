import type { Person } from '../../domain/aggregates/person.aggregate.js';
import type { DocumentType } from '../../domain/value-objects/document.js';
import type { PersonStatus } from '../../domain/value-objects/person-status.js';

export interface CreatePersonResult {
  id: string;
  fullName: string;
  preferredName: string | null;
  email: string;
  documentType: DocumentType;
  document: string;
  birthDate: string;
  phone: string | null;
  status: PersonStatus;
  createdAt: string;
}

export class CreatePersonResponse implements CreatePersonResult {
  private constructor(
    readonly id: string,
    readonly fullName: string,
    readonly preferredName: string | null,
    readonly email: string,
    readonly documentType: DocumentType,
    readonly document: string,
    readonly birthDate: string,
    readonly phone: string | null,
    readonly status: PersonStatus,
    readonly createdAt: string,
  ) {}

  static from(person: Person): CreatePersonResponse {
    const phone = person.getPhone();
    const preferredName = person.getPreferredName();

    return new CreatePersonResponse(
      person.getId().toString(),
      person.getFullName().toString(),
      preferredName ? preferredName.toString() : null,
      person.getEmail().toString(),
      person.getDocument().getType(),
      person.getDocument().getValue(),
      person.getBirthDate().toString(),
      phone ? phone.toString() : null,
      person.getStatus(),
      person.getCreatedAt().toISOString(),
    );
  }
}
