import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const where = search
      ? { nombre: { contains: search } as never }
      : {}
    const ingredientes = await db.ingrediente.findMany({
      where,
      orderBy: { nombre: 'asc' },
    })
    return NextResponse.json(ingredientes)
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener ingredientes' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nombre, descripcion, precio, stock, unidad, categoria } = body
    if (!nombre || precio === undefined) {
      return NextResponse.json({ error: 'Nombre y precio son requeridos' }, { status: 400 })
    }
    const ingrediente = await db.ingrediente.create({
      data: {
        nombre,
        descripcion: descripcion || null,
        precio: Number(precio),
        stock: Number(stock) || 0,
        unidad: unidad || 'kg',
        categoria: categoria || 'General',
      },
    })
    return NextResponse.json(ingrediente, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Error al crear ingrediente' }, { status: 500 })
  }
}