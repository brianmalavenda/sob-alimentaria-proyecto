#!/bin/sh
set -e
 
echo "Aplicando esquema de Prisma..."
# Si tenés carpeta prisma/migrations con migraciones reales, usá:
# ./node_modules/.bin/prisma migrate deploy
# Si el proyecto no tiene migraciones formales (solo schema.prisma), usá db push:
./node_modules/.bin/prisma db push 
 
echo "Iniciando servidor Next.js..."
exec bun server.js