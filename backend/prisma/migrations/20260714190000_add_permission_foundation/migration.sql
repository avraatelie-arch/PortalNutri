-- CreateEnum
CREATE TYPE "PermissionAssignmentStatus" AS ENUM ('ACTIVE', 'REMOVED');

-- CreateTable
CREATE TABLE "permissions" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "normalized_name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permission_assignments" (
    "id" TEXT NOT NULL,
    "role_id" TEXT NOT NULL,
    "permission_id" TEXT NOT NULL,
    "status" "PermissionAssignmentStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reactivated_at" TIMESTAMP(3),
    "removed_at" TIMESTAMP(3),

    CONSTRAINT "permission_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "permissions_tenant_id_idx" ON "permissions"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_tenant_id_normalized_name_key" ON "permissions"("tenant_id", "normalized_name");

-- CreateIndex
CREATE INDEX "permission_assignments_role_id_idx" ON "permission_assignments"("role_id");

-- CreateIndex
CREATE INDEX "permission_assignments_permission_id_idx" ON "permission_assignments"("permission_id");

-- CreateIndex
CREATE UNIQUE INDEX "permission_assignments_role_id_permission_id_key" ON "permission_assignments"("role_id", "permission_id");

-- AddForeignKey
ALTER TABLE "permissions" ADD CONSTRAINT "permissions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "permission_assignments" ADD CONSTRAINT "permission_assignments_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "permission_assignments" ADD CONSTRAINT "permission_assignments_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
