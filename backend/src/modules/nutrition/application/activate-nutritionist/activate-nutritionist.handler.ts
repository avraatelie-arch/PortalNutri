import type { NutritionistRepository } from '../../domain/repositories/nutritionist-repository.js';
import { NutritionistId } from '../../domain/value-objects/nutritionist-id.js';
import type { EventDispatcher } from '../../../../core/application/events/event-dispatcher.js';
import { executeNutritionistUseCase } from '../execute-nutritionist-use-case.js';
import { NutritionistNotFoundError } from '../errors/nutritionist-not-found.error.js';
import { ActivateNutritionistCommand } from './activate-nutritionist.command.js';
import { toActivateNutritionistResult } from './activate-nutritionist.result.js';

export class ActivateNutritionistHandler {
  constructor(
    private readonly nutritionistRepository: NutritionistRepository,
    private readonly eventDispatcher: EventDispatcher,
  ) {}

  async execute(command: ActivateNutritionistCommand) {
    return executeNutritionistUseCase(async () => {
      const nutritionist = await this.nutritionistRepository.findById(
        NutritionistId.create(command.nutritionistId),
      );

      if (!nutritionist) {
        throw new NutritionistNotFoundError(command.nutritionistId);
      }

      nutritionist.activate();
      const events = nutritionist.pullDomainEvents();

      if (events.length > 0) {
        await this.nutritionistRepository.save(nutritionist);
        await this.eventDispatcher.dispatch(events);
      }

      return toActivateNutritionistResult(nutritionist);
    });
  }
}
