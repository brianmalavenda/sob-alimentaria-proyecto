# Observatorio de Precios — cómo aplicar estos cambios

Este paquete agrega la sección **"Observatorio de Precios"** a `sob-alimentaria-proyecto`.

## Qué incluye

**Backend**
- `prisma/schema.prisma` → nuevo modelo `HistorialPrecio` (auditoría de precios), relacionado con `Ingrediente`.
- `prisma/seed.ts` → ahora también carga un historial de precios de ejemplo (dummy) para los 22 ingredientes. El precio de "Papa" quedó en $2000 para calzar con el ejemplo: 1/9 $800 → 15/9 $1500 → hoy $2000.
- `src/app/api/ingredientes/[id]/precio/route.ts` → cada cambio rápido de precio ahora registra un tramo en `HistorialPrecio`.
- `src/app/api/ingredientes/[id]/route.ts` → la edición completa de un ingrediente también audita el precio si cambió.
- `src/app/api/ingredientes/route.ts` → al crear un ingrediente se guarda su precio inicial como primer tramo de historial.
- `src/app/api/historial-precios/route.ts` (nuevo) → resumen por ingrediente: precio al inicio del rango, precio actual, variación $/%, cantidad de cambios. Soporta `?days=`, `?from=`, `?to=`, `?search=`, `?categoria=`.
- `src/app/api/historial-precios/[id]/route.ts` (nuevo) → historial completo de un ingrediente puntual, con la serie de tramos (fecha, precio, variación, motivo).

**Frontend**
- `src/components/sections/ObservatorioPreciosSection.tsx` (nuevo) → dashboard: tarjetas resumen, filtro por categoría/búsqueda, selector de rango de días, tabla de ingredientes con variación, y un diálogo de detalle con gráfico de línea (Recharts) + tabla de auditoría por producto.
- `src/components/AppShell.tsx` → se agregó el ítem de menú "Observatorio de Precios" (ícono `LineChart`) y se registra la sección.
- `src/lib/store.ts` → se agregó `'observatorio'` como sección válida del store.

**Datos**
- `db/custom.db` → ya tiene la tabla `HistorialPrecio` creada y poblada con datos dummy (85 tramos), para que puedas ver la sección funcionando sin correr ninguna migración primero. **Ojo:** esto reemplaza tu `db/custom.db` actual, que solo tenía los datos de seed original — si ya tenés datos reales en producción, no copies este archivo, saltá directo al paso de aplicar el schema (abajo).

## Cómo aplicarlo

1. Copiá todos los archivos de este paquete sobre las mismas rutas en tu repo (`sob-alimentaria-proyecto/`), respetando la estructura de carpetas.
2. **Si ya tenés datos reales en `db/custom.db`** (no el seed de ejemplo): no sobrescribas ese archivo. En su lugar, corré:
   ```bash
   bunx prisma generate
   bunx prisma db push
   ```
   Esto crea la tabla `HistorialPrecio` en tu base existente sin tocar el resto de los datos. Vas a ver la sección vacía hasta que empieces a cambiar precios (ahí se va a ir llenando el historial solo) — o corré `bunx prisma db seed` si querés los datos de ejemplo además de los tuyos (ojo que el seed borra ingredientes/platos/etc. existentes).
3. Si estás en Docker (tu flujo normal), simplemente reconstruí la imagen:
   ```bash
   docker compose build
   docker compose up -d
   ```
   Tu `Dockerfile` ya corre `bunx prisma generate` en el build y tu `entrypoint.sh` corre `prisma db push` al iniciar, así que la tabla nueva se crea sola.
4. Abrí la app → deberías ver "Observatorio de Precios" en el menú lateral.

## Nota sobre este entorno

No pude correr `prisma generate` / `prisma db push` ni levantar el server acá porque el sandbox donde trabajé no tiene salida de red hacia `binaries.prisma.sh` (de donde Prisma descarga sus motores). Tu Dockerfile sí lo hace sin problema en tu homelab. Igual pude:
- Verificar con `tsc --noEmit` que todo el código nuevo compila sin errores de sintaxis/tipos (aparte de los que dependen del cliente Prisma regenerado, que no pude generar acá).
- Editar directamente `db/custom.db` con Python/sqlite3 para crear la tabla y cargar los datos dummy a mano, replicando exactamente el DDL que generaría `prisma db push`.

Cualquier cosa que no ande como se espera al levantar el proyecto, avisame y lo ajustamos.
