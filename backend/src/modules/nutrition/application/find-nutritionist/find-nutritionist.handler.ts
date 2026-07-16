import type { NutritionistRepository } from '../../domain/repositories/nutritionist-repository.js';
import { NutritionistId } from '../../domain/value-objects/nutritionist-id.js';
import { executeNutritionistUseCase } from '../execute-nutritionist-use-case.js';
import { NutritionistNotFoundError } from '../errors/nutritionist-not-found.error.js';
import { FindNutritionistQuery } from './find-nutritionist.query.js';
import {
  toFindNutritionistResult,
  type FindNutritionistResult,
} from './find-nutritionist.result.js';

export class FindNutritionistHandler {
  constructor(private readonly nutritionistRepository: NutritionistRepository) {}

  async execute(query: FindNutritionistQuery): Promise<FindNutritionistResult> {
    return executeNutritionistUseCase(async () => {
      const nutritionist = await this.nutritionistRepository.findById(
        NutritionistId.create(query.nutritionistId),
      );

      if (!nutritionist) {
        throw new NutritionistNotFoundError(query.nutritionistId);
      }

      return toFindNutritionistResult(nutritionist);
    });
  }
}
