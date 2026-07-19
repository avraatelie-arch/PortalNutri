export type NutritionistDirectoryStatus = 'ACTIVE' | 'INACTIVE';

export interface NutritionistDirectoryEntry {
  id: string;
  tenantId: string;
  status: NutritionistDirectoryStatus;
}

export interface NutritionistDirectoryPort {
  findById(id: string): Promise<NutritionistDirectoryEntry | null>;
}
