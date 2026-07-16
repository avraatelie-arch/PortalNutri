import type { NutritionistRepository } from '../../domain/repositories/nutritionist-repository.js';
import type { UpdateNutritionistProfileProps } from '../../domain/aggregates/nutritionist.aggregate.js';
import { NutritionistId } from '../../domain/value-objects/nutritionist-id.js';
import { Specialty } from '../../domain/value-objects/specialty.js';
import type { EventDispatcher } from '../../../../core/application/events/event-dispatcher.js';
import { executeNutritionistUseCase } from '../execute-nutritionist-use-case.js';
import { NutritionistNotFoundError } from '../errors/nutritionist-not-found.error.js';
import { UpdateNutritionistProfileCommand } from './update-nutritionist-profile.command.js';
import { toUpdateNutritionistProfileResult } from './update-nutritionist-profile.result.js';

export class UpdateNutritionistProfileHandler {
  constructor(
    private readonly nutritionistRepository: NutritionistRepository,
    private readonly eventDispatcher: EventDispatcher,
  ) {}

  async execute(command: UpdateNutritionistProfileCommand) {
    return executeNutritionistUseCase(async () => {
      const nutritionist = await this.nutritionistRepository.findById(
        NutritionistId.create(command.request.nutritionistId),
      );

      if (!nutritionist) {
        throw new NutritionistNotFoundError(command.request.nutritionistId);
      }

      const updateProps: UpdateNutritionistProfileProps = {};

      if (command.request.specialty !== undefined) {
        updateProps.specialty = Specialty.create(command.request.specialty);
      }

      if (command.request.bio !== undefined) {
        updateProps.bio = command.request.bio;
      }

      nutritionist.updateProfile(updateProps);
      const events = nutritionist.pullDomainEvents();

      if (events.length > 0) {
        await this.nutritionistRepository.save(nutritionist);
        await this.eventDispatcher.dispatch(events);
      }

      return toUpdateNutritionistProfileResult(nutritionist);
    });
  }
}
