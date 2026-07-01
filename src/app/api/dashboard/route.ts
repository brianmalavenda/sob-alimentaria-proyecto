import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const [totalPlatos, totalBolsones, totalClientes, pedidosPendientes, pedidosPreparacion, pedidosListos, pedidosEntregados, pedidosHoy, recentPedidos] = await Promise.all([
      db.plato.count({ where: { activo: true } }),
      db.bolson.count({ where: { activo: true } }),
      db.cliente.count(),
      db.pedido.count({ where: { estado: 'PENDIENTE' } }),
      db.pedido.count({ where: { estado: 'EN_PREPARACION' } }),
      db.pedido.count({ where: { estado: 'LISTO' } }),
      db.pedido.count({ where: { estado: 'ENTREGADO' } }),
      db.pedido.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
      db.pedido.findMany({
        take: 5,
        include: { cliente: true, plato: true, bolson: true },
        orderBy: { createdAt: 'desc' },
      }),
    ])

    return NextResponse.json({
      totalPlatos,
      totalBolsones,
      totalClientes,
      pedidosPorEstado: {
        PENDIENTE: pedidosPendientes,
        EN_PREPARACION: pedidosPreparacion,
        LISTO: pedidosListos,
        ENTREGADO: pedidosEntregados,
      },
      pedidosHoy,
      recentPedidos,
    })
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener dashboard' }, { status: 500 })
  }
}