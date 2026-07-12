import type { PersonRepository } from '../../domain/repositories/person-repository.js';
import { PersonId } from '../../domain/value-objects/person-id.js';
import { executeUseCase } from '../execute-use-case.js';
import { PersonNotFoundError } from '../errors/person-not-found.error.js';
import { DeactivatePersonCommand } from './deactivate-person.command.js';
import { toDeactivatePersonResult } from './deactivate-person.result.js';

export class DeactivatePersonHandler {
  constructor(private readonly personRepository: PersonRepository) {}

  async execute(command: DeactivatePersonCommand) {
    return executeUseCase(async () => {
      const person = await this.personRepository.findById(
        PersonId.create(command.personId),
      );

      if (!person) {
        throw new PersonNotFoundError(command.personId);
      }

      person.deactivate();
      await this.personRepository.save(person);
      person.pullDomainEvents();

      return toDeactivatePersonResult(person);
    });
  }
}
