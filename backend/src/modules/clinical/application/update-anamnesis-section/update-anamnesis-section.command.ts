export interface UpdateAnamnesisSectionRequest {
  tenantId: string;
  anamnesisId: string;
  section: string;
  content?: string | null;
}

export class UpdateAnamnesisSectionCommand {
  constructor(readonly request: UpdateAnamnesisSectionRequest) {}
}
