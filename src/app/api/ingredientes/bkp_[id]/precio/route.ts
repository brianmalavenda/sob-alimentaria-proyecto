import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { precio } = await request.json()
    if (precio === undefined) {
      return NextResponse.json({ error: 'Precio es requerido' }, { status: 400 })
    }
    const ingrediente = await db.ingrediente.update({
      where: { id },
      data: { precio: Number(precio) },
    })
    return NextResponse.json(ingrediente)
  } catch (error) {
    return NextResponse.json({ error: 'Error al actualizar precio' }, { status: 500 })
  }
}