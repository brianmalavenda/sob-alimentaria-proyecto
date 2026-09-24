#!/bin/sh
set -e

echo "Aplicando esquema de Prisma..."
./node_modules/.bin/prisma db push

SEED_FLAG="/app/db/.seeded"
if [ ! -f "$SEED_FLAG" ]; then
  echo "Ejecutando seed inicial..."
  prisma db seed
  touch "$SEED_FLAG"
else
  echo "Seed ya aplicado anteriormente, se omite."
fi

echo "Iniciando servidor Next.js..."
exec bun server.js