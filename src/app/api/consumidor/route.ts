import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const where = search
      ? { nombre: { contains: search } as never }
      : {}
    const consumidores = await db.consumidor.findMany({
      where,
      orderBy: { nombre: 'asc' },
    })
    return NextResponse.json(consumidores)
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener consumidores' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nombre, telefono, email, direccion, notas } = body
    if (!nombre) {
      return NextResponse.json({ error: 'Nombre es requerido' }, { status: 400 })
    }
    const consumidor = await db.consumidor.create({
      data: {
        nombre,
        telefono: telefono || null,
        email: email || null,
        direccion: direccion || null,
        notas: notas || null,
      },
    })
    return NextResponse.json(consumidor, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Error al crear consumidor' }, { status: 500 })
  }
}