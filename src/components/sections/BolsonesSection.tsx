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

interface BolsonIngrediente {
  ingredienteId: string
  cantidad: number
  ingrediente?: Ingrediente
}

interface Bolson {
  id: string
  nombre: string
  descripcion: string | null
  tipo: string
  precio: number
  activo: boolean
  ingredientes: BolsonIngrediente[]
  createdAt: string
}

const TIPOS = [
  { value: 'GENERAL', label: 'General', color: 'bg-emerald-100 text-emerald-700' },
  { value: 'DIABETICO', label: 'Diabético', color: 'bg-orange-100 text-orange-700' },
  { value: 'SIN_TACC', label: 'Sin TACC', color: 'bg-purple-100 text-purple-700' },
]

const FILTER_TABS = [
  { value: '', label: 'Todos' },
  { value: 'GENERAL', label: 'General' },
  { value: 'DIABETICO', label: 'Diabético' },
  { value: 'SIN_TACC', label: 'Sin TACC' },
]

const formatPrice = (n: number) => `$${Math.round(n).toLocaleString('es-AR')}`

const getTipoColor = (tipo: string) => TIPOS.find((t) => t.value === tipo)?.color || 'bg-gray-100 text-gray-700'
const getTipoLabel = (tipo: string) => TIPOS.find((t) => t.value === tipo)?.label || tipo

const emptyForm = {
  nombre: '',
  descripcion: '',
  tipo: 'GENERAL',
  precio: 0,
  ingredientes: [] as { ingredienteId: string; cantidad: number }[],
}

export default function BolsonesSection() {
  const { toast } = useToast()
  const [bolsones, setBolsones] = useState<Bolson[]>([])
  const [loading, setLoading] = useState(true)
  const [tipoFilter, setTipoFilter] = useState('')
  const [allIngredientes, setAllIngredientes] = useState<Ingrediente[]>([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [detailBolson, setDetailBolson] = useState<Bolson | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const fetchBolsones = useCallback(async () => {
    try {
      const url = tipoFilter ? `/api/bolsones?tipo=${tipoFilter}` : '/api/bolsones'
      const res = await fetch(url)
      const data = await res.json()
      setBolsones(data)
    } catch {
      toast({ title: 'Error al cargar bolsones', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [tipoFilter, toast])

  const fetchIngredientes = useCallback(async () => {
    try {
      const res = await fetch('/api/ingredientes')
      const data = await res.json()
      setAllIngredientes(data)
    } catch { /* ignore */ }
  }, [])

  useEffect(() => {
    fetchBolsones()
  }, [fetchBolsones])

  useEffect(() => {
    fetchIngredientes()
  }, [fetchIngredientes])

  const openCreate = () => {
    setForm(emptyForm)
    setEditingId(null)
    setDialogOpen(true)
  }

  const openEdit = (bolson: Bolson) => {
    setForm({
      nombre: bolson.nombre,
      descripcion: bolson.descripcion || '',
      tipo: bolson.tipo,
      precio: bolson.precio,
      ingredientes: bolson.ingredientes.map((i) => ({
        ingredienteId: i.ingredienteId,
        cantidad: i.cantidad,
      })),
    })
    setEditingId(bolson.id)
    setDialogOpen(true)
  }

  const openDetail = (bolson: Bolson) => {
    setDetailBolson(bolson)
    setDetailOpen(true)
  }

  const handleSave = async () => {
    if (!form.nombre) {
      toast({ title: 'El nombre es requerido', variant: 'destructive' })
      return
    }
    try {
      const url = editingId ? `/api/bolsones/${editingId}` : '/api/bolsones'
      const method = editingId ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      toast({
        title: editingId ? 'Bolsón actualizado' : 'Bolsón creado',
        description: `"${form.nombre}" ${editingId ? 'actualizado' : 'creado'} correctamente`,
      })
      setDialogOpen(false)
      fetchBolsones()
    } catch {
      toast({ title: 'Error al guardar', variant: 'destructive' })
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      const res = await fetch(`/api/bolsones/${deleteId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      toast({ title: 'Bolsón eliminado' })
      setDeleteId(null)
      fetchBolsones()
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

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-1.5">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setTipoFilter(tab.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                tipoFilter === tab.value
                  ? 'bg-emerald-700 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <Button onClick={openCreate} className="bg-emerald-700 hover:bg-emerald-800 text-white w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Bolsón
        </Button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-56 rounded-xl" />
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && bolsones.length === 0 && (
        <div className="text-center py-16 text-gray-500">
          <p className="text-lg">No hay bolsones</p>
          <p className="text-sm mt-1">Creá tu primer bolsón con el botón de arriba</p>
        </div>
      )}

      {/* Cards */}
      <AnimatePresence>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bolsones.map((bolson) => (
            <motion.div
              key={bolson.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="h-full hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base font-semibold">{bolson.nombre}</CardTitle>
                    <Badge variant="secondary" className={getTipoColor(bolson.tipo)}>
                      {getTipoLabel(bolson.tipo)}
                    </Badge>
                  </div>
                  {bolson.descripcion && (
                    <p className="text-sm text-gray-500 line-clamp-2">{bolson.descripcion}</p>
                  )}
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-2xl font-bold text-emerald-700">
                    {formatPrice(bolson.precio)}
                  </div>

                  {bolson.ingredientes.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-gray-500 uppercase">Incluye</p>
                      <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                        {bolson.ingredientes.map((bi) => (
                          <Badge key={bi.ingredienteId} variant="outline" className="text-xs">
                            {bi.ingrediente?.nombre} ({bi.cantidad}{bi.ingrediente?.unidad})
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-1 pt-2">
                    <Button size="sm" variant="outline" onClick={() => openDetail(bolson)}>
                      <Eye className="w-3.5 h-3.5 mr-1" /> Ver
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => openEdit(bolson)}>
                      <Pencil className="w-3.5 h-3.5 mr-1" /> Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => setDeleteId(bolson.id)}
                    >
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
            <DialogTitle>{editingId ? 'Editar Bolsón' : 'Nuevo Bolsón'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nombre *</Label>
                <Input
                  value={form.nombre}
                  onChange={(e) => setForm((p) => ({ ...p, nombre: e.target.value }))}
                  placeholder="Ej: Bolsón Carnicero"
                />
              </div>
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select value={form.tipo} onValueChange={(v) => setForm((p) => ({ ...p, tipo: v }))}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIPOS.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Descripción</Label>
              <Textarea
                value={form.descripcion}
                onChange={(e) => setForm((p) => ({ ...p, descripcion: e.target.value }))}
                placeholder="Descripción del bolsón..."
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label>Precio *</Label>
              <Input
                type="number"
                value={form.precio || ''}
                onChange={(e) => setForm((p) => ({ ...p, precio: Number(e.target.value) }))}
                placeholder="0"
                className="max-w-xs"
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
                        onChange={(e) => updateIngrediente(idx, 'cantidad', Number(e.target.value))}
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
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} className="bg-emerald-700 hover:bg-emerald-800 text-white">
              {editingId ? 'Guardar Cambios' : 'Crear Bolsón'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{detailBolson?.nombre}</DialogTitle>
          </DialogHeader>
          {detailBolson && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className={getTipoColor(detailBolson.tipo)}>
                  {getTipoLabel(detailBolson.tipo)}
                </Badge>
              </div>
              {detailBolson.descripcion && (
                <p className="text-gray-600">{detailBolson.descripcion}</p>
              )}
              <div>
                <p className="text-sm text-gray-500">Precio</p>
                <p className="text-2xl font-bold text-emerald-700">{formatPrice(detailBolson.precio)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-2">Ingredientes incluidos</p>
                <div className="space-y-1">
                  {detailBolson.ingredientes.map((bi) => (
                    <div key={bi.ingredienteId} className="flex justify-between text-sm py-1 border-b last:border-0">
                      <span>{bi.ingrediente?.nombre}</span>
                      <span className="text-gray-500">{bi.cantidad} {bi.ingrediente?.unidad}</span>
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
            <AlertDialogTitle>¿Eliminar bolsón?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará el bolsón y sus relaciones con ingredientes.
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