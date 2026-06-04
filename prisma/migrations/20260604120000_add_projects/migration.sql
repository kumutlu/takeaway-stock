CREATE TABLE "Project" (
  "id" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Project_code_key" ON "Project"("code");

INSERT INTO "Project" ("id", "code", "name", "updatedAt")
VALUES ('00000000-0000-4000-8000-000000000001', 'WRAPNBOWL', 'Wrap''n Bowl', CURRENT_TIMESTAMP);

ALTER TABLE "User" ADD COLUMN "projectId" TEXT;
ALTER TABLE "Supplier" ADD COLUMN "projectId" TEXT;
ALTER TABLE "Brand" ADD COLUMN "projectId" TEXT;
ALTER TABLE "Product" ADD COLUMN "projectId" TEXT;
ALTER TABLE "AppSetting" ADD COLUMN "projectId" TEXT;

UPDATE "User" SET "projectId" = '00000000-0000-4000-8000-000000000001';
UPDATE "Supplier" SET "projectId" = '00000000-0000-4000-8000-000000000001';
UPDATE "Brand" SET "projectId" = '00000000-0000-4000-8000-000000000001';
UPDATE "Product" SET "projectId" = '00000000-0000-4000-8000-000000000001';
UPDATE "AppSetting" SET "projectId" = '00000000-0000-4000-8000-000000000001';

ALTER TABLE "User" ALTER COLUMN "projectId" SET NOT NULL;
ALTER TABLE "Supplier" ALTER COLUMN "projectId" SET NOT NULL;
ALTER TABLE "Brand" ALTER COLUMN "projectId" SET NOT NULL;
ALTER TABLE "Product" ALTER COLUMN "projectId" SET NOT NULL;
ALTER TABLE "AppSetting" ALTER COLUMN "projectId" SET NOT NULL;

CREATE SEQUENCE IF NOT EXISTS "AppSetting_id_seq";
SELECT setval('"AppSetting_id_seq"', COALESCE((SELECT MAX("id") FROM "AppSetting"), 0) + 1, false);
ALTER TABLE "AppSetting" ALTER COLUMN "id" SET DEFAULT nextval('"AppSetting_id_seq"');

DROP INDEX IF EXISTS "Supplier_name_key";
DROP INDEX IF EXISTS "Brand_name_key";

CREATE INDEX "User_projectId_idx" ON "User"("projectId");
CREATE INDEX "Supplier_projectId_idx" ON "Supplier"("projectId");
CREATE UNIQUE INDEX "Supplier_projectId_name_key" ON "Supplier"("projectId", "name");
CREATE INDEX "Brand_projectId_idx" ON "Brand"("projectId");
CREATE UNIQUE INDEX "Brand_projectId_name_key" ON "Brand"("projectId", "name");
CREATE INDEX "Product_projectId_idx" ON "Product"("projectId");
CREATE UNIQUE INDEX "AppSetting_projectId_key" ON "AppSetting"("projectId");

ALTER TABLE "User" ADD CONSTRAINT "User_projectId_fkey"
  FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Supplier" ADD CONSTRAINT "Supplier_projectId_fkey"
  FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Brand" ADD CONSTRAINT "Brand_projectId_fkey"
  FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Product" ADD CONSTRAINT "Product_projectId_fkey"
  FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AppSetting" ADD CONSTRAINT "AppSetting_projectId_fkey"
  FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
