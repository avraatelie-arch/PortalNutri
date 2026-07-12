export interface SecurityContext {
  personId: string;
  sessionId: string;
  tenantId: string | null;
}
