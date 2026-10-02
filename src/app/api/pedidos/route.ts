import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const estado = searchParams.get('estado') || ''
    const search = searchParams.get('search') || ''

    const where: Record<string, unknown> = {}
    if (estado) where.estado = estado
    if (search) {
      where.consumidor = { nombre: { contains: search } }
    }

    const pedidos = await db.pedido.findMany({
      where: Object.keys(where).length > 0 ? where : undefined,
      include: {
        consumidor: true,
        plato: true,
        bolson: true,
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(pedidos)
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener pedidos' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { consumidorId, tipo, platoId, bolsonId, cantidad, notas, total } = body
    if (!consumidorId || !tipo || !total) {
      return NextResponse.json({ error: 'Consumidor, tipo y total son requeridos' }, { status: 400 })
    }
    const pedido = await db.pedido.create({
      data: {
        consumidorId,
        tipo: tipo || 'PLATO',
        platoId: platoId || null,
        bolsonId: bolsonId || null,
        cantidad: Number(cantidad) || 1,
        notas: notas || null,
        total: Number(total),
      },
      include: { consumidor: true, plato: true, bolson: true },
    })
    return NextResponse.json(pedido, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Error al crear pedido' }, { status: 500 })
  }
}