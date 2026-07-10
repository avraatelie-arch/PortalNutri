import type { Person } from '../../domain/aggregates/person.aggregate.js';
import type { DomainEvent } from '../../domain/events/domain-event.js';
import type { DocumentType } from '../../domain/value-objects/document.js';
import type { PersonStatus } from '../../domain/value-objects/person-status.js';

export interface DeactivatePersonEventDto {
  eventName: string;
  aggregateId: string;
  occurredAt: string;
}

export interface DeactivatePersonResult {
  id: string;
  fullName: string;
  preferredName: string | null;
  email: string;
  phone: string | null;
  document: string;
  documentType: DocumentType;
  birthDate: string;
  status: PersonStatus;
  createdAt: string;
  updatedAt: string;
  events: readonly DeactivatePersonEventDto[];
}

export function toDeactivatePersonResult(
  person: Person,
  events: DomainEvent[],
): DeactivatePersonResult {
  const phone = person.getPhone();

  return {
    id: person.getId().toString(),
    fullName: person.getFullName().toString(),
    preferredName: person.getPreferredName()?.toString() ?? null,
    email: person.getEmail().toString(),
    phone: phone ? phone.toString() : null,
    document: person.getDocument().getValue(),
    documentType: person.getDocument().getType(),
    birthDate: person.getBirthDate().toString(),
    status: person.getStatus(),
    createdAt: person.getCreatedAt().toISOString(),
    updatedAt: person.getUpdatedAt().toISOString(),
    events: events.map((event) => ({
      eventName: event.eventName,
      aggregateId: event.aggregateId,
      occurredAt: event.occurredAt.toISOString(),
    })),
  };
}
