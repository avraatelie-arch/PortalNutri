import type { PersonRepository } from '../../domain/repositories/person-repository.js';
import { DomainError } from '../../domain/errors/domain-error.js';
import { BirthDate } from '../../domain/value-objects/birth-date.js';
import { Document } from '../../domain/value-objects/document.js';
import { Email } from '../../domain/value-objects/email.js';
import { FullName } from '../../domain/value-objects/full-name.js';
import { Person } from '../../domain/aggregates/person.aggregate.js';
import { Phone } from '../../domain/value-objects/phone.js';
import { PreferredName } from '../../domain/value-objects/preferred-name.js';
import { executeUseCase } from '../execute-use-case.js';
import type { EventDispatcher } from '../../../../core/application/events/event-dispatcher.js';
import { PersonDocumentAlreadyExistsError } from '../errors/person-document-already-exists.error.js';
import { PersonEmailAlreadyExistsError } from '../errors/person-email-already-exists.error.js';
import { CreatePersonCommand } from './create-person.command.js';
import { CreatePersonResponse } from './create-person.response.js';

export class CreatePersonHandler {
  constructor(
    private readonly personRepository: PersonRepository,
    private readonly eventDispatcher: EventDispatcher,
  ) {}

  async execute(command: CreatePersonCommand): Promise<CreatePersonResponse> {
    return executeUseCase(async () => {
      const { fullName, preferredName, email, documentType, document, birthDate, phone } =
        command.request;

      const fullNameVo = FullName.create(fullName);
      const preferredNameVo = PreferredName.createOptional(preferredName);
      const emailVo = Email.create(email);
      const documentVo = Document.create(documentType, document);
      const birthDateVo = BirthDate.create(parseBirthDate(birthDate));
      const phoneVo = Phone.createOptional(phone);

      if (await this.personRepository.existsByEmail(emailVo)) {
        throw new PersonEmailAlreadyExistsError(emailVo.toString());
      }

      if (await this.personRepository.existsByDocument(documentVo)) {
        throw new PersonDocumentAlreadyExistsError(
          documentVo.getType(),
          documentVo.getValue(),
        );
      }

      const person = Person.create({
        fullName: fullNameVo,
        preferredName: preferredNameVo,
        email: emailVo,
        document: documentVo,
        birthDate: birthDateVo,
        phone: phoneVo,
      });

      await this.personRepository.save(person);
      await this.eventDispatcher.dispatch(person.pullDomainEvents());

      return CreatePersonResponse.from(person);
    });
  }
}

function parseBirthDate(value: string): Date {
  const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;

  if (!isoDatePattern.test(value)) {
    throw new DomainError('BirthDate must use YYYY-MM-DD format.');
  }

  const [year, month, day] = value.split('-').map(Number);
  const parsedDate = new Date(year, month - 1, day);

  if (
    parsedDate.getFullYear() !== year ||
    parsedDate.getMonth() !== month - 1 ||
    parsedDate.getDate() !== day
  ) {
    throw new DomainError('BirthDate must use YYYY-MM-DD format.');
  }

  return parsedDate;
}
