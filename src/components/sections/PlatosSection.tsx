'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Pencil, Trash2, Eye, Search } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'

interface Ingrediente {
  id: string
  nombre: string
  unidad: string
  categoria: string
}

interface PlatoIngrediente {
  ingredienteId: string
  cantidad: number
  ingrediente?: Ingrediente
}

interface Plato {
  id: string
  nombre: string
  descripcion: string | null
  precio: number
  stock: number
  activo: boolean
  imagen: string | null
  ingredientes: PlatoIngrediente[]
  createdAt: string
}

const formatPrice = (n: number) => `$${Math.round(n).toLocaleString('es-AR')}`

const emptyForm = {
  nombre: '',
  descripcion: '',
  precio: 0,
  stock: 0,
  ingredientes: [] as { ingredienteId: string; cantidad: number }[],
}

export default function PlatosSection() {
  const { toast } = useToast()
  const [platos, setPlatos] = useState<Plato[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [allIngredientes, setAllIngredientes] = useState<Ingrediente[]>([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [detailPlato, setDetailPlato] = useState<Plato | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const fetchPlatos = useCallback(async () => {
    try {
      const res = await fetch('/api/platos')
      const data = await res.json()
      setPlatos(data)
    } catch {
      toast({ title: 'Error al cargar platos', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [toast])

  const fetchIngredientes = useCallback(async () => {
    try {
      const res = await fetch('/api/ingredientes')
      const data = await res.json()
      setAllIngredientes(data)
    } catch { /* ignore */ }
  }, [])

  useEffect(() => {
    fetchPlatos()
    fetchIngredientes()
  }, [fetchPlatos, fetchIngredientes])

  const filteredPlatos = platos.filter((p) =>
    p.nombre.toLowerCase().includes(search.toLowerCase())
  )

  const openCreate = () => {
    setForm(emptyForm)
    setEditingId(null)
    setDialogOpen(true)
  }

  const openEdit = (plato: Plato) => {
    setForm({
      nombre: plato.nombre,
      descripcion: plato.descripcion || '',
      precio: plato.precio,
      stock: plato.stock,
      ingredientes: plato.ingredientes.map((i) => ({
        ingredienteId: i.ingredienteId,
        cantidad: i.cantidad,
      })),
    })
    setEditingId(plato.id)
    setDialogOpen(true)
  }

  const openDetail = (plato: Plato) => {
    setDetailPlato(plato)
    setDetailOpen(true)
  }

  const handleSave = async () => {
    if (!form.nombre) {
      toast({ title: 'El nombre es requerido', variant: 'destructive' })
      return
    }
    try {
      const url = editingId ? `/api/platos/${editingId}` : '/api/platos'
      const method = editingId ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      toast({
        title: editingId ? 'Plato actualizado' : 'Plato creado',
        description: `"${form.nombre}" ${editingId ? 'actualizado' : 'agregado'} correctamente`,
      })
      setDialogOpen(false)
      fetchPlatos()
    } catch {
      toast({ title: 'Error al guardar', variant: 'destructive' })
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      const res = await fetch(`/api/platos/${deleteId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      toast({ title: 'Plato eliminado' })
      setDeleteId(null)
      fetchPlatos()
    } catch {
      toast({ title: 'Error al eliminar', variant: 'destructive' })
    }
  }

  const addIngrediente = () => {
    setForm((prev) => ({
      ...prev,
      ingredientes: [...prev.ingredientes, { ingredienteId: '', cantidad: 0 }],
    }))
  }

  const removeIngrediente = (idx: number) => {
    setForm((prev) => ({
      ...prev,
      ingredientes: prev.ingredientes.filter((_, i) => i !== idx),
    }))
  }

  const updateIngrediente = (idx: number, field: string, value: string | number) => {
    setForm((prev) => ({
      ...prev,
      ingredientes: prev.ingredientes.map((ing, i) =>
        i === idx ? { ...ing, [field]: value } : ing
      ),
    }))
  }

  const getStockColor = (stock: number) => {
    if (stock === 0) return 'bg-red-100 text-red-700'
    if (stock <= 5) return 'bg-amber-100 text-amber-700'
    return 'bg-emerald-100 text-emerald-700'
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Buscar plato..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button onClick={openCreate} className="bg-emerald-700 hover:bg-emerald-800 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Plato
        </Button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-52 rounded-xl" />
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && filteredPlatos.length === 0 && (
        <div className="text-center py-16 text-gray-500">
          <p className="text-lg">No hay platos</p>
          <p className="text-sm mt-1">Creá tu primer plato con el botón de arriba</p>
        </div>
      )}

      {/* Cards */}
      <AnimatePresence>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredPlatos.map((plato) => (
            <motion.div
              key={plato.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="h-full hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base font-semibold">{plato.nombre}</CardTitle>
                    <Badge className={getStockColor(plato.stock)} variant="secondary">
                      Stock: {plato.stock}
                    </Badge>
                  </div>
                  {plato.descripcion && (
                    <p className="text-sm text-gray-500 line-clamp-2">{plato.descripcion}</p>
                  )}
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-2xl font-bold text-emerald-700">
                    {formatPrice(plato.precio)}
                  </div>

                  {plato.ingredientes.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-gray-500 uppercase">Ingredientes</p>
                      <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                        {plato.ingredientes.slice(0, 5).map((pi) => (
                          <Badge key={pi.ingredienteId} variant="outline" className="text-xs">
                            {pi.ingrediente?.nombre} ({pi.cantidad}{pi.ingrediente?.unidad})
                          </Badge>
                        ))}
                        {plato.ingredientes.length > 5 && (
                          <Badge variant="outline" className="text-xs text-gray-400">
                            +{plato.ingredientes.length - 5} más
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-1 pt-2">
                    <Button size="sm" variant="outline" onClick={() => openDetail(plato)}>
                      <Eye className="w-3.5 h-3.5 mr-1" /> Ver
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => openEdit(plato)}>
                      <Pencil className="w-3.5 h-3.5 mr-1" /> Editar
                    </Button>
                    <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => setDeleteId(plato.id)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </AnimatePresence>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar Plato' : 'Nuevo Plato'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nombre *</Label>
                <Input
                  value={form.nombre}
                  onChange={(e) => setForm((p) => ({ ...p, nombre: e.target.value }))}
                  placeholder="Ej: Milanesas con Papas"
                />
              </div>
              <div className="space-y-2">
                <Label>Precio *</Label>
                <Input
                  type="number"
                  value={form.precio || ''}
                  onChange={(e) => setForm((p) => ({ ...p, precio: Number(e.target.value) }))}
                  placeholder="0"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Descripción</Label>
              <Textarea
                value={form.descripcion}
                onChange={(e) => setForm((p) => ({ ...p, descripcion: e.target.value }))}
                placeholder="Descripción del plato..."
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label>Stock</Label>
              <Input
                type="number"
                value={form.stock || ''}
                onChange={(e) => setForm((p) => ({ ...p, stock: Number(e.target.value) }))}
                placeholder="0"
              />
            </div>

            {/* Ingredientes */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Ingredientes</Label>
                <Button type="button" size="sm" variant="outline" onClick={addIngrediente}>
                  <Plus className="w-3.5 h-3.5 mr-1" /> Agregar
                </Button>
              </div>
              {form.ingredientes.length === 0 && (
                <p className="text-sm text-gray-400">No hay ingredientes. Hacé clic en Agregar.</p>
              )}
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {form.ingredientes.map((ing, idx) => (
                  <div key={idx} className="flex gap-2 items-end">
                    <div className="flex-1">
                      <Select
                        value={ing.ingredienteId}
                        onValueChange={(v) => updateIngrediente(idx, 'ingredienteId', v)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Seleccionar ingrediente" />
                        </SelectTrigger>
                        <SelectContent>
                          {allIngredientes.map((i) => (
                            <SelectItem key={i.id} value={i.id}>
                              {i.nombre} ({i.unidad})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-24">
                      <Input
                        type="number"
                        step="0.01"
                        value={ing.cantidad || ''}
                        onChange={(e) =>
                          updateIngrediente(idx, 'cantidad', Number(e.target.value))
                        }
                        placeholder="Cant."
                      />
                    </div>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="text-red-500 hover:text-red-700 h-9 w-9 flex-shrink-0"
                      onClick={() => removeIngrediente(idx)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} className="bg-emerald-700 hover:bg-emerald-800 text-white">
              {editingId ? 'Guardar Cambios' : 'Crear Plato'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{detailPlato?.nombre}</DialogTitle>
          </DialogHeader>
          {detailPlato && (
            <div className="space-y-4">
              {detailPlato.descripcion && (
                <p className="text-gray-600">{detailPlato.descripcion}</p>
              )}
              <div className="flex gap-4">
                <div>
                  <p className="text-sm text-gray-500">Precio</p>
                  <p className="text-2xl font-bold text-emerald-700">{formatPrice(detailPlato.precio)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Stock</p>
                  <p className="text-2xl font-bold">{detailPlato.stock} u.</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-2">Ingredientes</p>
                <div className="space-y-1">
                  {detailPlato.ingredientes.map((pi) => (
                    <div key={pi.ingredienteId} className="flex justify-between text-sm py-1 border-b last:border-0">
                      <span>{pi.ingrediente?.nombre}</span>
                      <span className="text-gray-500">
                        {pi.cantidad} {pi.ingrediente?.unidad}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar plato?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará el plato y su relación con ingredientes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}