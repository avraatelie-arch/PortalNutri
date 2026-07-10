import type { PersonRepository } from '../../domain/repositories/person-repository.js';
import { PersonId } from '../../domain/value-objects/person-id.js';
import { PersonNotFoundError } from '../errors/person-not-found.error.js';
import { FindPersonByIdQuery } from './find-person-by-id.query.js';
import {
  toFindPersonByIdResult,
  type FindPersonByIdResult,
} from './find-person-by-id.result.js';

export class FindPersonByIdHandler {
  constructor(private readonly personRepository: PersonRepository) {}

  async execute(query: FindPersonByIdQuery): Promise<FindPersonByIdResult> {
    const personId = PersonId.create(query.personId);
    const person = await this.personRepository.findById(personId);

    if (!person) {
      throw new PersonNotFoundError(query.personId);
    }

    return toFindPersonByIdResult(person);
  }
}
