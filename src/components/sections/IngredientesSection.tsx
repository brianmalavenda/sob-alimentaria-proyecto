'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Pencil, Trash2, Eye, Search, Check, X, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
  descripcion: string | null
  precio: number
  stock: number
  unidad: string
  categoria: string
  activo: boolean
  createdAt: string
}

const CATEGORIAS = ['General', 'Carnes', 'Verduras', 'Cereales', 'Aceites', 'Condimentos', 'Lácteos', 'Frutas', 'Salsas', 'Especiales']
const UNIDADES = ['kg', 'L', 'unidad', 'docena']

const CATEGORIA_COLORS: Record<string, string> = {
  Carnes: 'bg-red-100 text-red-700',
  Verduras: 'bg-emerald-100 text-emerald-700',
  Cereales: 'bg-amber-100 text-amber-700',
  Aceites: 'bg-yellow-100 text-yellow-700',
  Condimentos: 'bg-orange-100 text-orange-700',
  Lácteos: 'bg-sky-100 text-sky-700',
  Frutas: 'bg-pink-100 text-pink-700',
  Salsas: 'bg-rose-100 text-rose-700',
  Especiales: 'bg-purple-100 text-purple-700',
  General: 'bg-gray-100 text-gray-700',
}

const formatPrice = (n: number) => `$${Math.round(n).toLocaleString('es-AR')}`

const emptyForm = {
  nombre: '',
  descripcion: '',
  precio: 0,
  stock: 0,
  unidad: 'kg',
  categoria: 'General',
}

export default function IngredientesSection() {
  const { toast } = useToast()
  const [ingredientes, setIngredientes] = useState<Ingrediente[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('Todas')
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [detailIng, setDetailIng] = useState<Ingrediente | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  // Quick price edit
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null)
  const [editPriceValue, setEditPriceValue] = useState('')
  const priceInputRef = useRef<HTMLInputElement>(null)

  const fetchIngredientes = useCallback(async () => {
    try {
      const res = await fetch('/api/ingredientes')
      const data = await res.json()
      setIngredientes(data)
    } catch {
      toast({ title: 'Error al cargar ingredientes', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchIngredientes()
  }, [fetchIngredientes])

  // Focus price input when editing
  useEffect(() => {
    if (editingPriceId && priceInputRef.current) {
      priceInputRef.current.focus()
      priceInputRef.current.select()
    }
  }, [editingPriceId])

  const filteredIngredientes = ingredientes.filter((ing) => {
    const matchSearch = ing.nombre.toLowerCase().includes(search.toLowerCase())
    const matchCat = catFilter === 'Todas' || ing.categoria === catFilter
    return matchSearch && matchCat
  })

  const usedCategorias = [
    'Todas',
    ...Array.from(new Set(ingredientes.map((i) => i.categoria))),
  ]

  const openCreate = () => {
    setForm(emptyForm)
    setEditingId(null)
    setDialogOpen(true)
  }

  const openEdit = (ing: Ingrediente) => {
    setForm({
      nombre: ing.nombre,
      descripcion: ing.descripcion || '',
      precio: ing.precio,
      stock: ing.stock,
      unidad: ing.unidad,
      categoria: ing.categoria,
    })
    setEditingId(ing.id)
    setDialogOpen(true)
  }

  const openDetail = (ing: Ingrediente) => {
    setDetailIng(ing)
    setDetailOpen(true)
  }

  const startEditPrice = (ing: Ingrediente) => {
    setEditingPriceId(ing.id)
    setEditPriceValue(String(ing.precio))
  }

  const confirmEditPrice = async () => {
    if (!editingPriceId) return
    try {
      const res = await fetch(`/api/ingredientes/${editingPriceId}/precio`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ precio: Number(editPriceValue) }),
      })
      if (!res.ok) throw new Error()
      toast({ title: 'Precio actualizado', description: formatPrice(Number(editPriceValue)) })
      setEditingPriceId(null)
      fetchIngredientes()
    } catch {
      toast({ title: 'Error al actualizar precio', variant: 'destructive' })
    }
  }

  const cancelEditPrice = () => {
    setEditingPriceId(null)
  }

  const handleSave = async () => {
    if (!form.nombre) {
      toast({ title: 'El nombre es requerido', variant: 'destructive' })
      return
    }
    try {
      const url = editingId ? `/api/ingredientes/${editingId}` : '/api/ingredientes'
      const method = editingId ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      toast({
        title: editingId ? 'Ingrediente actualizado' : 'Ingrediente creado',
        description: `"${form.nombre}" ${editingId ? 'actualizado' : 'agregado'} correctamente`,
      })
      setDialogOpen(false)
      fetchIngredientes()
    } catch {
      toast({ title: 'Error al guardar', variant: 'destructive' })
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      const res = await fetch(`/api/ingredientes/${deleteId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      toast({ title: 'Ingrediente eliminado' })
      setDeleteId(null)
      fetchIngredientes()
    } catch {
      toast({ title: 'Error al eliminar', variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Buscar ingrediente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        <Button onClick={openCreate} className="bg-emerald-700 hover:bg-emerald-800 text-white w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Ingrediente
        </Button>
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-1.5">
        {usedCategorias.map((cat) => (
          <button
            key={cat}
            onClick={() => setCatFilter(cat)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer ${
              catFilter === cat
                ? 'bg-emerald-700 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      )}

      {/* Table */}
      {!loading && (
        <div className="border rounded-xl overflow-hidden bg-white">
          <div className="overflow-x-auto max-h-[calc(100vh-320px)] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 hover:bg-gray-50">
                  <TableHead className="font-semibold">Nombre</TableHead>
                  <TableHead className="font-semibold">Categoría</TableHead>
                  <TableHead className="font-semibold cursor-pointer select-none">
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5" /> Precio
                    </span>
                  </TableHead>
                  <TableHead className="font-semibold">Stock</TableHead>
                  <TableHead className="font-semibold">Unidad</TableHead>
                  <TableHead className="font-semibold text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence>
                  {filteredIngredientes.map((ing) => (
                    <motion.tr
                      key={ing.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="border-b hover:bg-gray-50 transition-colors"
                    >
                      <TableCell className="font-medium">{ing.nombre}</TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={CATEGORIA_COLORS[ing.categoria] || CATEGORIA_COLORS.General}
                        >
                          {ing.categoria}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {editingPriceId === ing.id ? (
                          <div className="flex items-center gap-1">
                            <Input
                              ref={priceInputRef}
                              type="number"
                              value={editPriceValue}
                              onChange={(e) => setEditPriceValue(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') confirmEditPrice()
                                if (e.key === 'Escape') cancelEditPrice()
                              }}
                              className="h-7 w-28 text-sm"
                            />
                            <Button size="icon" variant="ghost" className="h-7 w-7 text-emerald-600" onClick={confirmEditPrice}>
                              <Check className="w-3.5 h-3.5" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-7 w-7 text-red-500" onClick={cancelEditPrice}>
                              <X className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        ) : (
                          <button
                            onClick={() => startEditPrice(ing)}
                            className="flex items-center gap-1 group cursor-pointer hover:text-emerald-700 transition-colors"
                          >
                            <span className="font-medium">{formatPrice(ing.precio)}</span>
                            <Pencil className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className={ing.stock === 0 ? 'text-red-600 font-medium' : ''}>
                          {ing.stock}
                        </span>
                      </TableCell>
                      <TableCell className="text-gray-500">{ing.unidad}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-1 justify-end">
                          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openDetail(ing)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openEdit(ing)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => setDeleteId(ing.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))}
                </AnimatePresence>
                {!loading && filteredIngredientes.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-400">
                      No se encontraron ingredientes
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar Ingrediente' : 'Nuevo Ingrediente'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nombre *</Label>
              <Input
                value={form.nombre}
                onChange={(e) => setForm((p) => ({ ...p, nombre: e.target.value }))}
                placeholder="Ej: Pechuga de pollo"
              />
            </div>
            <div className="space-y-2">
              <Label>Descripción</Label>
              <Textarea
                value={form.descripcion}
                onChange={(e) => setForm((p) => ({ ...p, descripcion: e.target.value }))}
                placeholder="Descripción del ingrediente..."
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Precio *</Label>
                <Input
                  type="number"
                  value={form.precio || ''}
                  onChange={(e) => setForm((p) => ({ ...p, precio: Number(e.target.value) }))}
                  placeholder="0"
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
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Unidad</Label>
                <Select value={form.unidad} onValueChange={(v) => setForm((p) => ({ ...p, unidad: v }))}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {UNIDADES.map((u) => (
                      <SelectItem key={u} value={u}>{u}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Categoría</Label>
                <Select value={form.categoria} onValueChange={(v) => setForm((p) => ({ ...p, categoria: v }))}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIAS.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} className="bg-emerald-700 hover:bg-emerald-800 text-white">
              {editingId ? 'Guardar' : 'Crear'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{detailIng?.nombre}</DialogTitle>
          </DialogHeader>
          {detailIng && (
            <div className="space-y-3">
              {detailIng.descripcion && <p className="text-gray-600 text-sm">{detailIng.descripcion}</p>}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Precio</p>
                  <p className="text-lg font-bold text-emerald-700">{formatPrice(detailIng.precio)}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Stock</p>
                  <p className="text-lg font-bold">{detailIng.stock} {detailIng.unidad}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Categoría</p>
                  <Badge variant="secondary" className={CATEGORIA_COLORS[detailIng.categoria] || ''}>
                    {detailIng.categoria}
                  </Badge>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Estado</p>
                  <Badge variant="secondary" className={detailIng.activo ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}>
                    {detailIng.activo ? 'Activo' : 'Inactivo'}
                  </Badge>
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
            <AlertDialogTitle>¿Eliminar ingrediente?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El ingrediente se eliminará de todos los platos y bolsones donde se use.
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