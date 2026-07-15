export interface SelectTenantResult {
  sessionId: string;
  tenantId: string;
}

export class SelectTenantResponse implements SelectTenantResult {
  private constructor(
    readonly sessionId: string,
    readonly tenantId: string,
  ) {}

  static from(sessionId: string, tenantId: string): SelectTenantResponse {
    return new SelectTenantResponse(sessionId, tenantId);
  }
}
