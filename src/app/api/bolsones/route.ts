import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tipo = searchParams.get('tipo') || ''
    const where = tipo ? { tipo } : {}
    const bolsones = await db.bolson.findMany({
      where,
      include: { ingredientes: { include: { ingrediente: true } } },
      orderBy: { nombre: 'asc' },
    })
    return NextResponse.json(bolsones)
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener bolsones' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nombre, descripcion, tipo, precio, ingredientes } = body
    if (!nombre || precio === undefined) {
      return NextResponse.json({ error: 'Nombre y precio son requeridos' }, { status: 400 })
    }
    const bolson = await db.bolson.create({
      data: {
        nombre,
        descripcion: descripcion || null,
        tipo: tipo || 'GENERAL',
        precio: Number(precio),
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
    return NextResponse.json(bolson, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Error al crear bolsón' }, { status: 500 })
  }
}