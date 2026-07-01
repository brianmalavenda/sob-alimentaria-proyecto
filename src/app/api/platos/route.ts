import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const where = search
      ? { nombre: { contains: search } as never }
      : {}
    const platos = await db.plato.findMany({
      where,
      include: {
        ingredientes: { include: { ingrediente: true } },
      },
      orderBy: { nombre: 'asc' },
    })
    return NextResponse.json(platos)
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener platos' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nombre, descripcion, precio, stock, imagen, ingredientes } = body
    if (!nombre || precio === undefined) {
      return NextResponse.json({ error: 'Nombre y precio son requeridos' }, { status: 400 })
    }
    const plato = await db.plato.create({
      data: {
        nombre,
        descripcion: descripcion || null,
        precio: Number(precio),
        stock: Number(stock) || 0,
        imagen: imagen || null,
        ingredientes: ingredientes
          ? {
              create: ingredientes.map((i: { ingredienteId: string; cantidad: number }) => ({
                ingredienteId: i.ingredienteId,
                cantidad: Number(i.cantidad),
              })),
            }
          : undefined,
      },
      include: { ingredientes: { include: { ingrediente: true } } },
    })
    return NextResponse.json(plato, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Error al crear plato' }, { status: 500 })
  }
}