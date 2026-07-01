import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { estado } = await request.json()
    if (!estado) {
      return NextResponse.json({ error: 'Estado es requerido' }, { status: 400 })
    }
    const pedido = await db.pedido.update({
      where: { id },
      data: { estado },
      include: { cliente: true, plato: true, bolson: true },
    })
    return NextResponse.json(pedido)
  } catch (error) {
    return NextResponse.json({ error: 'Error al actualizar estado' }, { status: 500 })
  }
}