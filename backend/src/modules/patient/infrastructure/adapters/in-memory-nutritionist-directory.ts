import type {
  NutritionistDirectoryEntry,
  NutritionistDirectoryPort,
} from '../../application/ports/nutritionist-directory.port.js';

export class InMemoryNutritionistDirectory implements NutritionistDirectoryPort {
  private readonly entries = new Map<string, NutritionistDirectoryEntry>();

  seed(entry: NutritionistDirectoryEntry): void {
    this.entries.set(entry.id, entry);
  }

  async findById(id: string): Promise<NutritionistDirectoryEntry | null> {
    return this.entries.get(id) ?? null;
  }
}
