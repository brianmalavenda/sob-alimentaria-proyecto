import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const ingrediente = await db.ingrediente.findUnique({ where: { id } })
    if (!ingrediente) {
      return NextResponse.json({ error: 'Ingrediente no encontrado' }, { status: 404 })
    }
    return NextResponse.json(ingrediente)
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener ingrediente' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const ingrediente = await db.ingrediente.update({
      where: { id },
      data: {
        nombre: body.nombre,
        descripcion: body.descripcion ?? null,
        precio: Number(body.precio),
        stock: Number(body.stock) || 0,
        unidad: body.unidad || 'kg',
        categoria: body.categoria || 'General',
        activo: body.activo ?? true,
      },
    })
    return NextResponse.json(ingrediente)
  } catch (error) {
    return NextResponse.json({ error: 'Error al actualizar ingrediente' }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await db.ingrediente.delete({ where: { id } })
    return NextResponse.json({}, { status: 204 })
  } catch (error) {
    return NextResponse.json({ error: 'Error al eliminar ingrediente' }, { status: 500 })
  }
}