-- CreateEnum
CREATE TYPE "CredentialStatus" AS ENUM ('ACTIVE', 'LOCKED', 'DISABLED', 'EXPIRED');

-- CreateTable
CREATE TABLE "credentials" (
    "id" TEXT NOT NULL,
    "person_id" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "status" "CredentialStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "credentials_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "credentials_person_id_key" ON "credentials"("person_id");

-- AddForeignKey
ALTER TABLE "credentials" ADD CONSTRAINT "credentials_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "persons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
