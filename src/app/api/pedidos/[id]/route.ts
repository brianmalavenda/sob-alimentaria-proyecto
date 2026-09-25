import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const pedido = await db.pedido.findUnique({
      where: { id },
      include: { consumidor: true, plato: true, bolson: true },
    })
    if (!pedido) {
      return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 })
    }
    return NextResponse.json(pedido)
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener pedido' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const pedido = await db.pedido.update({
      where: { id },
      data: {
        consumidorId: body.consumidorId,
        tipo: body.tipo,
        platoId: body.platoId ?? null,
        bolsonId: body.bolsonId ?? null,
        cantidad: Number(body.cantidad) || 1,
        estado: body.estado,
        notas: body.notas ?? null,
        total: Number(body.total),
      },
      include: { consumidor: true, plato: true, bolson: true },
    })
    return NextResponse.json(pedido)
  } catch (error) {
    return NextResponse.json({ error: 'Error al actualizar pedido' }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await db.pedido.delete({ where: { id } })
    return NextResponse.json({}, { status: 204 })
  } catch (error) {
    return NextResponse.json({ error: 'Error al eliminar pedido' }, { status: 500 })
  }
}