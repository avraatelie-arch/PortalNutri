export interface FindAnamnesisRequest {
  tenantId: string;
  anamnesisId: string;
}

export class FindAnamnesisQuery {
  constructor(readonly request: FindAnamnesisRequest) {}
}
