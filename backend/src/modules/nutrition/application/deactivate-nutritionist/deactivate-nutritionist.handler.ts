import type { NutritionistRepository } from '../../domain/repositories/nutritionist-repository.js';
import { NutritionistId } from '../../domain/value-objects/nutritionist-id.js';
import type { EventDispatcher } from '../../../../core/application/events/event-dispatcher.js';
import { executeNutritionistUseCase } from '../execute-nutritionist-use-case.js';
import { NutritionistNotFoundError } from '../errors/nutritionist-not-found.error.js';
import { DeactivateNutritionistCommand } from './deactivate-nutritionist.command.js';
import { toDeactivateNutritionistResult } from './deactivate-nutritionist.result.js';

export class DeactivateNutritionistHandler {
  constructor(
    private readonly nutritionistRepository: NutritionistRepository,
    private readonly eventDispatcher: EventDispatcher,
  ) {}

  async execute(command: DeactivateNutritionistCommand) {
    return executeNutritionistUseCase(async () => {
      const nutritionist = await this.nutritionistRepository.findById(
        NutritionistId.create(command.nutritionistId),
      );

      if (!nutritionist) {
        throw new NutritionistNotFoundError(command.nutritionistId);
      }

      nutritionist.deactivate();
      const events = nutritionist.pullDomainEvents();

      if (events.length > 0) {
        await this.nutritionistRepository.save(nutritionist);
        await this.eventDispatcher.dispatch(events);
      }

      return toDeactivateNutritionistResult(nutritionist);
    });
  }
}
