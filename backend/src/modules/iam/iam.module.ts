import type { FastifyInstance } from 'fastify';
import { getPrismaClient } from '../../core/database/prisma-client.js';
import { CreatePersonHandler } from './application/create-person/create-person.handler.js';
import { DeactivatePersonHandler } from './application/deactivate-person/deactivate-person.handler.js';
import { FindPersonByIdHandler } from './application/find-person-by-id/find-person-by-id.handler.js';
import { UpdatePersonHandler } from './application/update-person/update-person.handler.js';
import { registerPersonRoutes } from './contracts/api/person.routes.js';
import { PrismaPersonRepository } from './infrastructure/repositories/prisma-person.repository.js';

export async function registerIamModule(app: FastifyInstance): Promise<void> {
  const prisma = getPrismaClient();
  const personRepository = new PrismaPersonRepository(prisma);

  const handlers = {
    createPersonHandler: new CreatePersonHandler(personRepository),
    findPersonByIdHandler: new FindPersonByIdHandler(personRepository),
    updatePersonHandler: new UpdatePersonHandler(personRepository),
    deactivatePersonHandler: new DeactivatePersonHandler(personRepository),
  };

  await registerPersonRoutes(app, handlers);
}
