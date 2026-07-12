import { CreatePersonCommand } from '../../application/create-person/create-person.command.js';
import type { CreatePersonBody } from './schemas/person.schemas.js';

export function toCreatePersonCommand(body: CreatePersonBody): CreatePersonCommand {
  return CreatePersonCommand.fromHttpInput(body);
}
