import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const bolson = await db.bolson.findUnique({
      where: { id },
      include: { ingredientes: { include: { ingrediente: true } } },
    })
    if (!bolson) {
      return NextResponse.json({ error: 'Bolsón no encontrado' }, { status: 404 })
    }
    return NextResponse.json(bolson)
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener bolsón' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { nombre, descripcion, tipo, precio, activo, ingredientes } = body

    if (ingredientes) {
      await db.bolsonIngrediente.deleteMany({ where: { bolsonId: id } })
    }

    const bolson = await db.bolson.update({
      where: { id },
      data: {
        nombre,
        descripcion: descripcion ?? null,
        tipo: tipo || 'GENERAL',
        precio: Number(precio),
        activo: activo ?? true,
        ...(ingredientes
          ? {
              ingredientes: {
                create: ingredientes.map((i: { ingredienteId: string; cantidad: number }) => ({
                  ingredienteId: i.ingredienteId,
                  cantidad: Number(i.cantidad),
                })),
              },
            }
          : {}),
      },
      include: { ingredientes: { include: { ingrediente: true } } },
    })
    return NextResponse.json(bolson)
  } catch (error) {
    return NextResponse.json({ error: 'Error al actualizar bolsón' }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await db.bolson.delete({ where: { id } })
    return NextResponse.json({}, { status: 204 })
  } catch (error) {
    return NextResponse.json({ error: 'Error al eliminar bolsón' }, { status: 500 })
  }
}