import type { PersonRepository } from '../../domain/repositories/person-repository.js';
import type { UpdatePersonProps } from '../../domain/aggregates/person.aggregate.js';
import { Email } from '../../domain/value-objects/email.js';
import { FullName } from '../../domain/value-objects/full-name.js';
import { PersonId } from '../../domain/value-objects/person-id.js';
import { Phone } from '../../domain/value-objects/phone.js';
import { PreferredName } from '../../domain/value-objects/preferred-name.js';
import { ApplicationError } from '../errors/application-error.js';
import { PersonNotFoundError } from '../errors/person-not-found.error.js';
import { UpdatePersonCommand } from './update-person.command.js';
import { toUpdatePersonResult } from './update-person.result.js';

export class UpdatePersonHandler {
  constructor(private readonly personRepository: PersonRepository) {}

  async execute(command: UpdatePersonCommand) {
    const { personId, fullName, preferredName, email, phone } = command.request;

    const id = PersonId.create(personId);
    const person = await this.personRepository.findById(id);

    if (!person) {
      throw new PersonNotFoundError(personId);
    }

    const updateProps: UpdatePersonProps = {};

    if (fullName !== undefined) {
      updateProps.fullName = FullName.create(fullName);
    }

    if (preferredName !== undefined) {
      updateProps.preferredName = PreferredName.createOptional(preferredName);
    }

    if (email !== undefined) {
      const emailVo = Email.create(email);
      const existingByEmail = await this.personRepository.findByEmail(emailVo);

      if (existingByEmail && !existingByEmail.getId().equals(person.getId())) {
        throw new ApplicationError('Email is already registered.');
      }

      updateProps.email = emailVo;
    }

    if (phone !== undefined) {
      updateProps.phone = Phone.createOptional(phone);
    }

    person.update(updateProps);
    await this.personRepository.save(person);

    const events = person.pullDomainEvents();

    return toUpdatePersonResult(person, events);
  }
}
