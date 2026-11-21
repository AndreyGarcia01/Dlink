-- O campo requiresInterpreter foi adicionado ao schema.prisma sem migration
-- (a coluna foi criada direto no banco de produção). Esta migration registra a
-- mudança para que qualquer banco novo (ex.: o de desenvolvimento) fique igual.
-- "IF NOT EXISTS" deixa ela segura na produção, onde a coluna já existe.

-- AlterTable
ALTER TABLE "applications" ADD COLUMN IF NOT EXISTS "requires_interpreter" BOOLEAN NOT NULL DEFAULT false;
