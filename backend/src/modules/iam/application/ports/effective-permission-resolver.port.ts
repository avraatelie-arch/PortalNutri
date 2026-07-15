export interface EffectivePermissionResolver {
  hasActivePermission(params: {
    personId: string;
    tenantId: string;
    permissionKey: string;
  }): Promise<boolean>;
}
