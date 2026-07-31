#!/bin/sh
set -e

echo "Aplicando esquema de Prisma..."
# Si tenés carpeta prisma/migrations con migraciones reales, usá:
# bunx prisma migrate deploy
# Si el proyecto no tiene migraciones formales (solo schema.prisma), usá db push:
# bunx prisma db push --skip-generate
./initialize_prisma.sh

echo "Iniciando servidor Next.js..."
exec bun server.js