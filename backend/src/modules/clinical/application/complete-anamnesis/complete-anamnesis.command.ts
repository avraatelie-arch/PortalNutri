export interface CompleteAnamnesisRequest {
  tenantId: string;
  anamnesisId: string;
}

export class CompleteAnamnesisCommand {
  constructor(readonly request: CompleteAnamnesisRequest) {}
}
