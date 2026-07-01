import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const plato = await db.plato.findUnique({
      where: { id },
      include: { ingredientes: { include: { ingrediente: true } } },
    })
    if (!plato) {
      return NextResponse.json({ error: 'Plato no encontrado' }, { status: 404 })
    }
    return NextResponse.json(plato)
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener plato' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { nombre, descripcion, precio, stock, imagen, activo, ingredientes } = body

    // Delete existing ingredients and recreate
    if (ingredientes) {
      await db.platoIngrediente.deleteMany({ where: { platoId: id } })
    }

    const plato = await db.plato.update({
      where: { id },
      data: {
        nombre,
        descripcion: descripcion ?? null,
        precio: Number(precio),
        stock: Number(stock) || 0,
        imagen: imagen ?? null,
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
    return NextResponse.json(plato)
  } catch (error) {
    return NextResponse.json({ error: 'Error al actualizar plato' }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await db.plato.delete({ where: { id } })
    return NextResponse.json({}, { status: 204 })
  } catch (error) {
    return NextResponse.json({ error: 'Error al eliminar plato' }, { status: 500 })
  }
}