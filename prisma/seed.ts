import { db } from '../src/lib/db'

async function main() {
  // Limpiar datos existentes
  await db.pedido.deleteMany()
  await db.consumidor.deleteMany()
  await db.platoIngrediente.deleteMany()
  await db.bolsonIngrediente.deleteMany()
  await db.plato.deleteMany()
  await db.bolson.deleteMany()
  await db.ingrediente.deleteMany()

  // === INGREDIENTES ===
  const ingredientes = await Promise.all([
    db.ingrediente.create({ data: { nombre: 'Pechuga de pollo', descripcion: 'Pechuga de pollo fresca', precio: 4500, stock: 20, unidad: 'kg', categoria: 'Carnes' } }),
    db.ingrediente.create({ data: { nombre: 'Carne molida', descripcion: 'Carne molida magra', precio: 5200, stock: 15, unidad: 'kg', categoria: 'Carnes' } }),
    db.ingrediente.create({ data: { nombre: 'Costilla de cerdo', descripcion: 'Costilla de cerdo fresca', precio: 4800, stock: 10, unidad: 'kg', categoria: 'Carnes' } }),
    db.ingrediente.create({ data: { nombre: 'Arroz', descripcion: 'Arroz largo fino', precio: 1200, stock: 30, unidad: 'kg', categoria: 'Cereales' } }),
    db.ingrediente.create({ data: { nombre: 'Papa', descripcion: 'Papa blanca', precio: 800, stock: 25, unidad: 'kg', categoria: 'Verduras' } }),
    db.ingrediente.create({ data: { nombre: 'Zanahoria', descripcion: 'Zanahoria fresca', precio: 700, stock: 15, unidad: 'kg', categoria: 'Verduras' } }),
    db.ingrediente.create({ data: { nombre: 'Cebolla', descripcion: 'Cebolla cabezona', precio: 600, stock: 20, unidad: 'kg', categoria: 'Verduras' } }),
    db.ingrediente.create({ data: { nombre: 'Tomate', descripcion: 'Tomate perita', precio: 900, stock: 18, unidad: 'kg', categoria: 'Verduras' } }),
    db.ingrediente.create({ data: { nombre: 'Morrón rojo', descripcion: 'Morrón rojo fresco', precio: 1100, stock: 10, unidad: 'kg', categoria: 'Verduras' } }),
    db.ingrediente.create({ data: { nombre: 'Aceite de girasol', descripcion: 'Aceite de girasol 1L', precio: 1800, stock: 12, unidad: 'L', categoria: 'Aceites' } }),
    db.ingrediente.create({ data: { nombre: 'Sal', descripcion: 'Sal fina', precio: 400, stock: 10, unidad: 'kg', categoria: 'Condimentos' } }),
    db.ingrediente.create({ data: { nombre: 'Pimienta', descripcion: 'Pimienta negra molida', precio: 3500, stock: 3, unidad: 'kg', categoria: 'Condimentos' } }),
    db.ingrediente.create({ data: { nombre: 'Ajo', descripcion: 'Ajo fresco', precio: 2500, stock: 5, unidad: 'kg', categoria: 'Verduras' } }),
    db.ingrediente.create({ data: { nombre: 'Limón', descripcion: 'Limón fresco', precio: 1500, stock: 8, unidad: 'kg', categoria: 'Frutas' } }),
    db.ingrediente.create({ data: { nombre: 'Lechuga', descripcion: 'Lechuga crespa', precio: 800, stock: 10, unidad: 'kg', categoria: 'Verduras' } }),
    db.ingrediente.create({ data: { nombre: 'Huevo', descripcion: 'Huevo de gallina (docena)', precio: 2200, stock: 20, unidad: 'docena', categoria: 'Lácteos' } }),
    db.ingrediente.create({ data: { nombre: 'Harina de trigo', descripcion: 'Harina 000', precio: 900, stock: 25, unidad: 'kg', categoria: 'Cereales' } }),
    db.ingrediente.create({ data: { nombre: 'Harina de maíz', descripcion: 'Harina de maíz sin TACC', precio: 1500, stock: 15, unidad: 'kg', categoria: 'Cereales' } }),
    db.ingrediente.create({ data: { nombre: 'Queso rallado', descripcion: 'Queso rallado', precio: 6000, stock: 8, unidad: 'kg', categoria: 'Lácteos' } }),
    db.ingrediente.create({ data: { nombre: 'Salsa de tomate', descripcion: 'Salsa de tomate casera', precio: 2000, stock: 10, unidad: 'L', categoria: 'Salsas' } }),
    db.ingrediente.create({ data: { nombre: 'Edulcorante', descripcion: 'Edulcorante apto diabéticos', precio: 3500, stock: 10, unidad: 'kg', categoria: 'Especiales' } }),
    db.ingrediente.create({ data: { nombre: 'Stevia', descripcion: 'Stevia en polvo', precio: 5000, stock: 5, unidad: 'kg', categoria: 'Especiales' } }),
  ])

  // Helper
  const ing = (nombre: string) => ingredientes.find(i => i.nombre === nombre)!

  // === PLATOS ===
  const plato1 = await db.plato.create({
    data: {
      nombre: 'Arroz con Pollo',
      descripcion: 'Clásico arroz con pollo, zanahoria, morrón y especias',
      precio: 5500,
      stock: 15,
      ingredientes: {
        create: [
          { ingredienteId: ing('Pechuga de pollo').id, cantidad: 0.3 },
          { ingredienteId: ing('Arroz').id, cantidad: 0.2 },
          { ingredienteId: ing('Zanahoria').id, cantidad: 0.1 },
          { ingredienteId: ing('Morrón rojo').id, cantidad: 0.05 },
          { ingredienteId: ing('Cebolla').id, cantidad: 0.05 },
          { ingredienteId: ing('Ajo').id, cantidad: 0.01 },
          { ingredienteId: ing('Aceite de girasol').id, cantidad: 0.03 },
          { ingredienteId: ing('Sal').id, cantidad: 0.005 },
        ]
      }
    }
  })

  const plato2 = await db.plato.create({
    data: {
      nombre: 'Milanesas de Carne con Papas Fritas',
      descripcion: 'Milanesas de carne molida con guarnición de papas fritas',
      precio: 6500,
      stock: 10,
      ingredientes: {
        create: [
          { ingredienteId: ing('Carne molida').id, cantidad: 0.25 },
          { ingredienteId: ing('Huevo').id, cantidad: 0.5 },
          { ingredienteId: ing('Harina de trigo').id, cantidad: 0.1 },
          { ingredienteId: ing('Papa').id, cantidad: 0.3 },
          { ingredienteId: ing('Aceite de girasol').id, cantidad: 0.1 },
          { ingredienteId: ing('Limón').id, cantidad: 0.05 },
          { ingredienteId: ing('Sal').id, cantidad: 0.005 },
        ]
      }
    }
  })

  const plato3 = await db.plato.create({
    data: {
      nombre: 'Costillas al Horno con Ensalada',
      descripcion: 'Costillas de cerdo al horno con ensalada fresca de lechuga y tomate',
      precio: 7500,
      stock: 8,
      ingredientes: {
        create: [
          { ingredienteId: ing('Costilla de cerdo').id, cantidad: 0.4 },
          { ingredienteId: ing('Papa').id, cantidad: 0.2 },
          { ingredienteId: ing('Lechuga').id, cantidad: 0.1 },
          { ingredienteId: ing('Tomate').id, cantidad: 0.1 },
          { ingredienteId: ing('Cebolla').id, cantidad: 0.05 },
          { ingredienteId: ing('Ajo').id, cantidad: 0.01 },
          { ingredienteId: ing('Sal').id, cantidad: 0.005 },
          { ingredienteId: ing('Pimienta').id, cantidad: 0.002 },
        ]
      }
    }
  })

  const plato4 = await db.plato.create({
    data: {
      nombre: 'Tortilla de Papas',
      descripcion: 'Tortilla de papas española con cebolla y huevo',
      precio: 4500,
      stock: 12,
      ingredientes: {
        create: [
          { ingredienteId: ing('Papa').id, cantidad: 0.3 },
          { ingredienteId: ing('Huevo').id, cantidad: 1.5 },
          { ingredienteId: ing('Cebolla').id, cantidad: 0.1 },
          { ingredienteId: ing('Aceite de girasol').id, cantidad: 0.05 },
          { ingredienteId: ing('Sal').id, cantidad: 0.005 },
        ]
      }
    }
  })

  const plato5 = await db.plato.create({
    data: {
      nombre: 'Empanadas de Carne (docena)',
      descripcion: 'Docena de empanadas de carne con cebolla, huevo y especias',
      precio: 8000,
      stock: 6,
      ingredientes: {
        create: [
          { ingredienteId: ing('Carne molida').id, cantidad: 0.4 },
          { ingredienteId: ing('Cebolla').id, cantidad: 0.2 },
          { ingredienteId: ing('Huevo').id, cantidad: 1 },
          { ingredienteId: ing('Harina de trigo').id, cantidad: 0.3 },
          { ingredienteId: ing('Aceite de girasol').id, cantidad: 0.05 },
          { ingredienteId: ing('Pimienta').id, cantidad: 0.005 },
          { ingredienteId: ing('Sal').id, cantidad: 0.01 },
          { ingredienteId: ing('Ajo').id, cantidad: 0.02 },
        ]
      }
    }
  })

  // === BOLSONES ===
  const bolson1 = await db.bolson.create({
    data: {
      nombre: 'Bolsón Carnicero',
      descripcion: 'Seleccion de cortes de carne para la semana. Ideal para familias.',
      tipo: 'GENERAL',
      precio: 18000,
      ingredientes: {
        create: [
          { ingredienteId: ing('Pechuga de pollo').id, cantidad: 1.5 },
          { ingredienteId: ing('Carne molida').id, cantidad: 1 },
          { ingredienteId: ing('Costilla de cerdo').id, cantidad: 1 },
        ]
      }
    }
  })

  const bolson2 = await db.bolson.create({
    data: {
      nombre: 'Bolsón Verduras',
      descripcion: 'Seleccion de verduras frescas de temporada. Paquete completo para la semana.',
      tipo: 'GENERAL',
      precio: 8500,
      ingredientes: {
        create: [
          { ingredienteId: ing('Papa').id, cantidad: 2 },
          { ingredienteId: ing('Zanahoria').id, cantidad: 1 },
          { ingredienteId: ing('Cebolla').id, cantidad: 1 },
          { ingredienteId: ing('Tomate').id, cantidad: 1.5 },
          { ingredienteId: ing('Morrón rojo').id, cantidad: 0.5 },
          { ingredienteId: ing('Lechuga').id, cantidad: 1 },
        ]
      }
    }
  })

  const bolson3 = await db.bolson.create({
    data: {
      nombre: 'Bolsón Diabético',
      descripcion: 'Productos especiales aptos para personas con diabetes. Sin azúcar añadida.',
      tipo: 'DIABETICO',
      precio: 12000,
      ingredientes: {
        create: [
          { ingredienteId: ing('Pechuga de pollo').id, cantidad: 1 },
          { ingredienteId: ing('Lechuga').id, cantidad: 1 },
          { ingredienteId: ing('Tomate').id, cantidad: 1 },
          { ingredienteId: ing('Zanahoria').id, cantidad: 1 },
          { ingredienteId: ing('Edulcorante').id, cantidad: 0.5 },
          { ingredienteId: ing('Stevia').id, cantidad: 0.2 },
        ]
      }
    }
  })

  const bolson4 = await db.bolson.create({
    data: {
      nombre: 'Bolsón Sin TACC',
      descripcion: 'Productos libres de gluten. Ideales para celíacos e intolerantes al gluten.',
      tipo: 'SIN_TACC',
      precio: 14000,
      ingredientes: {
        create: [
          { ingredienteId: ing('Harina de maíz').id, cantidad: 2 },
          { ingredienteId: ing('Pechuga de pollo').id, cantidad: 1 },
          { ingredienteId: ing('Papa').id, cantidad: 2 },
          { ingredienteId: ing('Tomate').id, cantidad: 1 },
          { ingredienteId: ing('Huevo').id, cantidad: 1 },
          { ingredienteId: ing('Queso rallado').id, cantidad: 0.5 },
        ]
      }
    }
  })

  // === consumidorS ===
  const consumidor1 = await db.consumidor.create({
    data: { nombre: 'María García', telefono: '1155001234', email: 'maria@email.com', direccion: 'Av. San Martín 234' }
  })
  const consumidor2 = await db.consumidor.create({
    data: { nombre: 'Juan Pérez', telefono: '1155005678', email: 'juan@email.com', direccion: 'Calle Mitre 567' }
  })
  const consumidor3 = await db.consumidor.create({
    data: { nombre: 'Ana López', telefono: '1155009012', email: 'ana@email.com', direccion: 'Bv. España 890' }
  })
  const consumidor4 = await db.consumidor.create({
    data: { nombre: 'Carlos Rodríguez', telefono: '1155003456', email: 'carlos@email.com', direccion: 'Pasaje Colón 123' }
  })

  // === PEDIDOS ===
  await db.pedido.create({
    data: {
      consumidorId: consumidor1.id,
      tipo: 'PLATO',
      platoId: plato1.id,
      cantidad: 3,
      estado: 'ENTREGADO',
      total: 16500,
      notas: 'Sin morrón por favor'
    }
  })
  await db.pedido.create({
    data: {
      consumidorId: consumidor2.id,
      tipo: 'PLATO',
      platoId: plato3.id,
      cantidad: 2,
      estado: 'LISTO',
      total: 15000,
    }
  })
  await db.pedido.create({
    data: {
      consumidorId: consumidor3.id,
      tipo: 'BOLSON',
      bolsonId: bolson3.id,
      cantidad: 1,
      estado: 'EN_PREPARACION',
      total: 12000,
      notas: 'consumidor diabético, verificar todos los ingredientes'
    }
  })
  await db.pedido.create({
    data: {
      consumidorId: consumidor4.id,
      tipo: 'BOLSON',
      bolsonId: bolson4.id,
      cantidad: 1,
      estado: 'PENDIENTE',
      total: 14000,
    }
  })
  await db.pedido.create({
    data: {
      consumidorId: consumidor1.id,
      tipo: 'PLATO',
      platoId: plato5.id,
      cantidad: 1,
      estado: 'PENDIENTE',
      total: 8000,
    }
  })

  console.log('✅ Seed data creado exitosamente!')
  console.log(`- 22 ingredientes`)
  console.log(`- 5 platos`)
  console.log(`- 4 bolsones`)
  console.log(`- 4 consumidors`)
  console.log(`- 5 pedidos`)
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => db.$disconnect())