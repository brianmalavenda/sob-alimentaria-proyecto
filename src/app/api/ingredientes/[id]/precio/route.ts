import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { precio, motivo, usuario } = await request.json()
    if (precio === undefined) {
      return NextResponse.json({ error: 'Precio es requerido' }, { status: 400 })
    }
    const nuevoPrecio = Number(precio)

    const actual = await db.ingrediente.findUnique({ where: { id }, select: { precio: true } })
    if (!actual) {
      return NextResponse.json({ error: 'Ingrediente no encontrado' }, { status: 404 })
    }

    const [ingrediente] = await db.$transaction([
      db.ingrediente.update({ where: { id }, data: { precio: nuevoPrecio } }),
      // Auditoría: queda registrado el tramo de vigencia del precio anterior
      // y arranca uno nuevo desde ahora con el precio actualizado.
      db.historialPrecio.create({
        data: {
          ingredienteId: id,
          precio: nuevoPrecio,
          precioAnterior: actual.precio,
          usuario: usuario || null,
          motivo: motivo || 'Actualización manual de precio',
        },
      }),
    ])

    return NextResponse.json(ingrediente)
  } catch (error) {
    return NextResponse.json({ error: 'Error al actualizar precio' }, { status: 500 })
  }
}