import type { EventDispatcher } from '../../../core/application/events/event-dispatcher.js';
import type { MembershipRepository } from '../../iam/domain/repositories/membership-repository.js';
import type { PersonRepository } from '../../iam/domain/repositories/person-repository.js';
import type { TenantRepository } from '../../iam/domain/repositories/tenant-repository.js';
import type { NutritionistRepository } from '../domain/repositories/nutritionist-repository.js';
import { ActivateNutritionistHandler } from '../application/activate-nutritionist/activate-nutritionist.handler.js';
import { CreateNutritionistHandler } from '../application/create-nutritionist/create-nutritionist.handler.js';
import { DeactivateNutritionistHandler } from '../application/deactivate-nutritionist/deactivate-nutritionist.handler.js';
import { FindNutritionistHandler } from '../application/find-nutritionist/find-nutritionist.handler.js';
import { UpdateNutritionistProfileHandler } from '../application/update-nutritionist-profile/update-nutritionist-profile.handler.js';

export interface NutritionistFactoryDependencies {
  nutritionistRepository: NutritionistRepository;
  personRepository: PersonRepository;
  tenantRepository: TenantRepository;
  membershipRepository: MembershipRepository;
  eventDispatcher: EventDispatcher;
}

export interface NutritionistHandlers {
  createNutritionistHandler: CreateNutritionistHandler;
  findNutritionistHandler: FindNutritionistHandler;
  activateNutritionistHandler: ActivateNutritionistHandler;
  deactivateNutritionistHandler: DeactivateNutritionistHandler;
  updateNutritionistProfileHandler: UpdateNutritionistProfileHandler;
}

export function createNutritionistHandlers({
  nutritionistRepository,
  personRepository,
  tenantRepository,
  membershipRepository,
  eventDispatcher,
}: NutritionistFactoryDependencies): NutritionistHandlers {
  return {
    createNutritionistHandler: new CreateNutritionistHandler(
      nutritionistRepository,
      personRepository,
      tenantRepository,
      membershipRepository,
      eventDispatcher,
    ),
    findNutritionistHandler: new FindNutritionistHandler(nutritionistRepository),
    activateNutritionistHandler: new ActivateNutritionistHandler(
      nutritionistRepository,
      eventDispatcher,
    ),
    deactivateNutritionistHandler: new DeactivateNutritionistHandler(
      nutritionistRepository,
      eventDispatcher,
    ),
    updateNutritionistProfileHandler: new UpdateNutritionistProfileHandler(
      nutritionistRepository,
      eventDispatcher,
    ),
  };
}
