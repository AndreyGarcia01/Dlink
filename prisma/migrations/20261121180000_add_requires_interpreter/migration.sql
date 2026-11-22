
ALTER TABLE "applications" ADD COLUMN IF NOT EXISTS "requires_interpreter" BOOLEAN NOT NULL DEFAULT false;
