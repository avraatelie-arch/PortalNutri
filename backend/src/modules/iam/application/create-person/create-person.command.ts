import type { CreatePersonRequest } from './create-person.request.js';

export class CreatePersonCommand {
  constructor(readonly request: CreatePersonRequest) {}
}
