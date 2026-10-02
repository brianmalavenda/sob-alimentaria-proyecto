import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// Observatorio de Precios — resumen por ingrediente.
// Devuelve, para cada ingrediente, el precio vigente al inicio del rango
// pedido, el precio actual, la variación entre ambos y cuántos cambios de
// precio (tramos de auditoría) se registraron dentro del rango.
//
// Query params:
//   days: cantidad de días hacia atrás desde hoy (default 30)
//   from / to: rango explícito en formato ISO (tienen prioridad sobre days)
//   search: filtro por nombre de ingrediente
//   categoria: filtro por categoría exacta
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const days = Number(searchParams.get('days') || 30)
    const search = searchParams.get('search') || ''
    const categoria = searchParams.get('categoria') || ''
    const fromParam = searchParams.get('from')
    const toParam = searchParams.get('to')

    const hasta = toParam ? new Date(toParam) : new Date()
    const desde = fromParam
      ? new Date(fromParam)
      : new Date(new Date(hasta).setDate(hasta.getDate() - days))

    const [ingredientes, historial] = await Promise.all([
      db.ingrediente.findMany({
        where: {
          ...(search ? { nombre: { contains: search } as never } : {}),
          ...(categoria && categoria !== 'Todas' ? { categoria } : {}),
        },
        orderBy: { nombre: 'asc' },
      }),
      // Traemos todo el historial ordenado; el dataset de una MSP chica es
      // acotado y agrupar en memoria es más simple que N queries.
      db.historialPrecio.findMany({
        orderBy: { vigenciaDesde: 'asc' },
      }),
    ])

    const porIngrediente = new Map<string, typeof historial>()
    for (const tramo of historial) {
      const lista = porIngrediente.get(tramo.ingredienteId) || []
      lista.push(tramo)
      porIngrediente.set(tramo.ingredienteId, lista)
    }

    const items = ingredientes.map((ing) => {
      const tramos = porIngrediente.get(ing.id) || []
      const previos = tramos.filter((t) => t.vigenciaDesde <= desde)
      const dentroRango = tramos.filter((t) => t.vigenciaDesde > desde && t.vigenciaDesde <= hasta)

      // Precio vigente al arrancar el rango: el último tramo anterior al
      // rango, o si el ingrediente no tenía historial previo, el primer
      // precio que se le conoce (o, en última instancia, el precio actual).
      const precioInicioRango =
        previos.length > 0
          ? previos[previos.length - 1].precio
          : tramos.length > 0
            ? tramos[0].precio
            : ing.precio

      const precioActual = ing.precio
      const variacion = precioActual - precioInicioRango
      const variacionPct = precioInicioRango > 0 ? (variacion / precioInicioRango) * 100 : 0
      const ultimoTramo = tramos[tramos.length - 1]

      return {
        ingredienteId: ing.id,
        nombre: ing.nombre,
        categoria: ing.categoria,
        unidad: ing.unidad,
        precioActual,
        precioInicioRango,
        variacion,
        variacionPct,
        cantidadCambios: dentroRango.length,
        ultimaActualizacion: ultimoTramo ? ultimoTramo.vigenciaDesde : ing.updatedAt,
        tieneHistorial: tramos.length > 0,
      }
    })

    return NextResponse.json({
      rango: { desde: desde.toISOString(), hasta: hasta.toISOString(), dias: days },
      items,
    })
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener el observatorio de precios' }, { status: 500 })
  }
}
