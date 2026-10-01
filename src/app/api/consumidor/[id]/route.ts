import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const consumidor = await db.consumidor.findUnique({
      where: { id },
      include: {
        pedidos: {
          include: { plato: true, bolson: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    })
    if (!consumidor) {
      return NextResponse.json({ error: 'consumidor no encontrado' }, { status: 404 })
    }
    return NextResponse.json(consumidor)
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener consumidor' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const consumidor = await db.consumidor.update({
      where: { id },
      data: {
        nombre: body.nombre,
        telefono: body.telefono ?? null,
        email: body.email ?? null,
        direccion: body.direccion ?? null,
        notas: body.notas ?? null,
      },
    })
    return NextResponse.json(consumidor)
  } catch (error) {
    return NextResponse.json({ error: 'Error al actualizar consumidor' }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await db.consumidor.delete({ where: { id } })
    return NextResponse.json({}, { status: 204 })
  } catch (error) {
    return NextResponse.json({ error: 'Error al eliminar consumidor' }, { status: 500 })
  }
}