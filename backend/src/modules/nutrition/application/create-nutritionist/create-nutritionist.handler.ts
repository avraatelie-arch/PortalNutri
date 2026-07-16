import type { MembershipRepository } from '../../../iam/domain/repositories/membership-repository.js';
import type { PersonRepository } from '../../../iam/domain/repositories/person-repository.js';
import type { TenantRepository } from '../../../iam/domain/repositories/tenant-repository.js';
import type { NutritionistRepository } from '../../domain/repositories/nutritionist-repository.js';
import { Nutritionist } from '../../domain/aggregates/nutritionist.aggregate.js';
import { Crn } from '../../domain/value-objects/crn.js';
import { Specialty } from '../../domain/value-objects/specialty.js';
import { StateCode } from '../../domain/value-objects/state-code.js';
import { PersonId } from '../../../iam/domain/value-objects/person-id.js';
import { TenantId } from '../../../iam/domain/value-objects/tenant-id.js';
import type { EventDispatcher } from '../../../../core/application/events/event-dispatcher.js';
import { MembershipInactiveError } from '../../../iam/application/errors/membership-inactive.error.js';
import { MembershipNotFoundError } from '../../../iam/application/errors/membership-not-found.error.js';
import { PersonNotFoundError } from '../../../iam/application/errors/person-not-found.error.js';
import { TenantNotFoundError } from '../../../iam/application/errors/tenant-not-found.error.js';
import { executeNutritionistUseCase } from '../execute-nutritionist-use-case.js';
import { NutritionistCrnAlreadyExistsError } from '../errors/nutritionist-crn-already-exists.error.js';
import { CreateNutritionistCommand } from './create-nutritionist.command.js';
import { toCreateNutritionistResponse } from './create-nutritionist.response.js';

export class CreateNutritionistHandler {
  constructor(
    private readonly nutritionistRepository: NutritionistRepository,
    private readonly personRepository: PersonRepository,
    private readonly tenantRepository: TenantRepository,
    private readonly membershipRepository: MembershipRepository,
    private readonly eventDispatcher: EventDispatcher,
  ) {}

  async execute(command: CreateNutritionistCommand) {
    return executeNutritionistUseCase(async () => {
      const personId = PersonId.create(command.request.personId);
      const tenantId = TenantId.create(command.request.tenantId);

      const person = await this.personRepository.findById(personId);

      if (!person) {
        throw new PersonNotFoundError(command.request.personId);
      }

      const tenant = await this.tenantRepository.findById(tenantId);

      if (!tenant) {
        throw new TenantNotFoundError(command.request.tenantId);
      }

      const membership = await this.membershipRepository.findByPersonAndTenant(
        personId,
        tenantId,
      );

      if (!membership) {
        throw new MembershipNotFoundError(
          undefined,
          command.request.personId,
          command.request.tenantId,
        );
      }

      if (!membership.isActive()) {
        throw new MembershipInactiveError(membership.getId().toString());
      }

      const crn = Crn.create(command.request.crn);

      if (await this.nutritionistRepository.existsByCrn(tenantId, crn)) {
        throw new NutritionistCrnAlreadyExistsError(
          command.request.tenantId,
          crn.toString(),
        );
      }

      const nutritionist = Nutritionist.create({
        personId,
        tenantId,
        crn,
        stateCode: StateCode.create(command.request.stateCode),
        specialty: Specialty.create(command.request.specialty),
        bio: command.request.bio,
      });

      await this.nutritionistRepository.save(nutritionist);
      await this.eventDispatcher.dispatch(nutritionist.pullDomainEvents());

      return toCreateNutritionistResponse(nutritionist);
    });
  }
}
