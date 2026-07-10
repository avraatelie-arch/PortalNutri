import type { Person } from '../../domain/aggregates/person.aggregate.js';
import type { DomainEvent } from '../../domain/events/domain-event.js';
import type { DocumentType } from '../../domain/value-objects/document.js';
import type { PersonStatus } from '../../domain/value-objects/person-status.js';

export interface CreatePersonEventDto {
  eventName: string;
  aggregateId: string;
  occurredAt: string;
}

export class CreatePersonResponse {
  private constructor(
    readonly personId: string,
    readonly fullName: string,
    readonly preferredName: string | null,
    readonly email: string,
    readonly documentType: DocumentType,
    readonly documentValue: string,
    readonly birthDate: string,
    readonly phone: string | null,
    readonly status: PersonStatus,
    readonly createdAt: string,
    readonly events: readonly CreatePersonEventDto[],
  ) {}

  static from(person: Person, events: DomainEvent[]): CreatePersonResponse {
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
      events.map((event) => ({
        eventName: event.eventName,
        aggregateId: event.aggregateId,
        occurredAt: event.occurredAt.toISOString(),
      })),
    );
  }
}
