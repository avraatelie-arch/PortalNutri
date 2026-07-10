import type { PersonRepository } from '../../domain/repositories/person-repository.js';
import { BirthDate } from '../../domain/value-objects/birth-date.js';
import { Document } from '../../domain/value-objects/document.js';
import { Email } from '../../domain/value-objects/email.js';
import { FullName } from '../../domain/value-objects/full-name.js';
import { Person } from '../../domain/aggregates/person.aggregate.js';
import { Phone } from '../../domain/value-objects/phone.js';
import { PreferredName } from '../../domain/value-objects/preferred-name.js';
import { ApplicationError } from '../errors/application-error.js';
import { CreatePersonCommand } from './create-person.command.js';
import { CreatePersonResponse } from './create-person.response.js';

export class CreatePersonHandler {
  constructor(private readonly personRepository: PersonRepository) {}

  async execute(command: CreatePersonCommand): Promise<CreatePersonResponse> {
    const { fullName, preferredName, email, documentType, documentValue, birthDate, phone } =
      command.request;

    const fullNameVo = FullName.create(fullName);
    const preferredNameVo = PreferredName.createOptional(preferredName);
    const emailVo = Email.create(email);
    const documentVo = Document.create(documentType, documentValue);
    const birthDateVo = BirthDate.create(parseBirthDate(birthDate));
    const phoneVo = Phone.createOptional(phone);

    if (await this.personRepository.existsByEmail(emailVo)) {
      throw new ApplicationError('Email is already registered.');
    }

    if (await this.personRepository.existsByDocument(documentVo)) {
      throw new ApplicationError('Document is already registered.');
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

    const events = person.pullDomainEvents();

    return CreatePersonResponse.from(person, events);
  }
}

function parseBirthDate(value: string): Date {
  const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;

  if (!isoDatePattern.test(value)) {
    throw new ApplicationError('BirthDate must use YYYY-MM-DD format.');
  }

  const [year, month, day] = value.split('-').map(Number);
  const parsedDate = new Date(year, month - 1, day);

  if (
    parsedDate.getFullYear() !== year ||
    parsedDate.getMonth() !== month - 1 ||
    parsedDate.getDate() !== day
  ) {
    throw new ApplicationError('BirthDate must use YYYY-MM-DD format.');
  }

  return parsedDate;
}
