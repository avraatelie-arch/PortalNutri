import type { EventDispatcher } from '../../../core/application/events/event-dispatcher.js';
import type { PersonRepository } from '../domain/repositories/person-repository.js';
import { CreatePersonHandler } from '../application/create-person/create-person.handler.js';
import { DeactivatePersonHandler } from '../application/deactivate-person/deactivate-person.handler.js';
import { FindPersonByIdHandler } from '../application/find-person-by-id/find-person-by-id.handler.js';
import { UpdatePersonHandler } from '../application/update-person/update-person.handler.js';

export interface PersonFactoryDependencies {
  personRepository: PersonRepository;
  eventDispatcher: EventDispatcher;
}

export interface PersonHandlers {
  createPersonHandler: CreatePersonHandler;
  findPersonByIdHandler: FindPersonByIdHandler;
  updatePersonHandler: UpdatePersonHandler;
  deactivatePersonHandler: DeactivatePersonHandler;
}

export function createPersonHandlers({
  personRepository,
  eventDispatcher,
}: PersonFactoryDependencies): PersonHandlers {
  return {
    createPersonHandler: new CreatePersonHandler(
      personRepository,
      eventDispatcher,
    ),
    findPersonByIdHandler: new FindPersonByIdHandler(personRepository),
    updatePersonHandler: new UpdatePersonHandler(
      personRepository,
      eventDispatcher,
    ),
    deactivatePersonHandler: new DeactivatePersonHandler(
      personRepository,
      eventDispatcher,
    ),
  };
}
