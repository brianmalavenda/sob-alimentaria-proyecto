import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// Observatorio de Precios — historial completo de un ingrediente.
// Devuelve cada tramo de precio dentro del rango pedido, más el tramo
// vigente justo antes del rango (para que el gráfico arranque con una
// línea, no en el vacío).
//
// Query params: days (default 90) o from/to explícitos.
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const days = Number(searchParams.get('days') || 90)
    const fromParam = searchParams.get('from')
    const toParam = searchParams.get('to')

    const hasta = toParam ? new Date(toParam) : new Date()
    const desde = fromParam
      ? new Date(fromParam)
      : new Date(new Date(hasta).setDate(hasta.getDate() - days))

    const [ingrediente, tramos] = await Promise.all([
      db.ingrediente.findUnique({ where: { id } }),
      db.historialPrecio.findMany({
        where: { ingredienteId: id },
        orderBy: { vigenciaDesde: 'asc' },
      }),
    ])

    if (!ingrediente) {
      return NextResponse.json({ error: 'Ingrediente no encontrado' }, { status: 404 })
    }

    const previos = tramos.filter((t) => t.vigenciaDesde <= desde)
    const dentroRango = tramos.filter((t) => t.vigenciaDesde > desde && t.vigenciaDesde <= hasta)
    const puntoInicial = previos.length > 0 ? previos[previos.length - 1] : undefined

    const serie = puntoInicial ? [puntoInicial, ...dentroRango] : dentroRango

    const historial = serie.map((t) => ({
      id: t.id,
      fecha: t.vigenciaDesde,
      precio: t.precio,
      precioAnterior: t.precioAnterior,
      variacion: t.precioAnterior != null ? t.precio - t.precioAnterior : null,
      variacionPct:
        t.precioAnterior !== null && t.precioAnterior !== undefined && t.precioAnterior > 0
          ? ((t.precio - t.precioAnterior) / t.precioAnterior) * 100
          : null,
      motivo: t.motivo,
      usuario: t.usuario,
    }))

    const primero = historial[0]
    const ultimo = historial[historial.length - 1]

    return NextResponse.json({
      ingrediente: {
        id: ingrediente.id,
        nombre: ingrediente.nombre,
        categoria: ingrediente.categoria,
        unidad: ingrediente.unidad,
        precioActual: ingrediente.precio,
      },
      rango: { desde: desde.toISOString(), hasta: hasta.toISOString(), dias: days },
      resumen: primero && ultimo
        ? {
            precioInicial: primero.precio,
            precioFinal: ultimo.precio,
            variacion: ultimo.precio - primero.precio,
            variacionPct: primero.precio > 0 ? ((ultimo.precio - primero.precio) / primero.precio) * 100 : 0,
            cantidadCambios: dentroRango.length,
          }
        : null,
      historial,
    })
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener historial del ingrediente' }, { status: 500 })
  }
}
