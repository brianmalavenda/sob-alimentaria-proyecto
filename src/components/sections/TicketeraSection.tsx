'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  Trash2,
  ChevronRight,
  ShoppingCart,
  Users,
  Package,
  Clock,
  CheckCircle2,
  ChefHat,
  Truck,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
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
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'

interface Consumidor {
  id: string
  nombre: string
  telefono: string | null
  email: string | null
}

interface Plato {
  id: string
  nombre: string
  precio: number
}

interface Bolson {
  id: string
  nombre: string
  precio: number
  tipo: string
}

interface Pedido {
  id: string
  consumidorId: string
  tipo: string
  platoId: string | null
  bolsonId: string | null
  cantidad: number
  estado: string
  notas: string | null
  total: number
  createdAt: string
  consumidor?: Consumidor
  plato?: Plato | null
  bolson?: Bolson | null
}

interface Dashboard {
  totalPlatos: number
  totalBolsones: number
  totalConsumidores: number
  pedidosPorEstado: Record<string, number>
  pedidosHoy: number
}

const ESTADOS = [
  { value: '', label: 'Todos', icon: ShoppingCart, color: 'bg-gray-100 text-gray-700' },
  { value: 'PENDIENTE', label: 'Pendientes', icon: Clock, color: 'bg-amber-100 text-amber-700' },
  { value: 'EN_PREPARACION', label: 'En Preparación', icon: ChefHat, color: 'bg-sky-100 text-sky-700' },
  { value: 'LISTO', label: 'Listos', icon: CheckCircle2, color: 'bg-emerald-100 text-emerald-700' },
  { value: 'ENTREGADO', label: 'Entregados', icon: Truck, color: 'bg-gray-100 text-gray-500' },
]

const NEXT_ESTADO: Record<string, string> = {
  PENDIENTE: 'EN_PREPARACION',
  EN_PREPARACION: 'LISTO',
  LISTO: 'ENTREGADO',
}

const ESTADO_BADGE: Record<string, string> = {
  PENDIENTE: 'bg-amber-100 text-amber-700',
  EN_PREPARACION: 'bg-sky-100 text-sky-700',
  LISTO: 'bg-emerald-100 text-emerald-700',
  ENTREGADO: 'bg-gray-100 text-gray-500',
}

const formatPrice = (n: number) => `$${Math.round(n).toLocaleString('es-AR')}`
const formatDate = (d: string) => {
  const date = new Date(d)
  return date.toLocaleDateString('es-AR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

export default function TicketeraSection() {
  const { toast } = useToast()
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [loading, setLoading] = useState(true)
  const [estadoFilter, setEstadoFilter] = useState('')
  const [dashboard, setDashboard] = useState<Dashboard | null>(null)
  const [consumidores, setConsumidores] = useState<Consumidor[]>([])
  const [platos, setPlatos] = useState<Plato[]>([])
  const [bolsones, setBolsones] = useState<Bolson[]>([])
  const [deleteId, setDeleteId] = useState<string | null>(null)

  // Create form
  const [dialogOpen, setDialogOpen] = useState(false)
  const [formConsumidor, setFormConsumidor] = useState('')
  const [formTipo, setFormTipo] = useState<'PLATO' | 'BOLSON'>('PLATO')
  const [formItemId, setFormItemId] = useState('')
  const [formCantidad, setFormCantidad] = useState(1)
  const [formNotas, setFormNotas] = useState('')
  const [formTotal, setFormTotal] = useState(0)

  const fetchPedidos = useCallback(async () => {
    try {
      const url = estadoFilter ? `/api/pedidos?estado=${estadoFilter}` : '/api/pedidos'
      const res = await fetch(url)
      const data = await res.json()
      setPedidos(data)
    } catch {
      toast({ title: 'Error al cargar pedidos', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [estadoFilter, toast])

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await fetch('/api/dashboard')
      const data = await res.json()
      setDashboard(data)
    } catch { /* ignore */ }
  }, [])

  const fetchConsumidores = useCallback(async () => {
    try {
      const res = await fetch('/api/consumidores')
      const data = await res.json()
      setConsumidores(data)
    } catch { /* ignore */ }
  }, [])

  const fetchPlatos = useCallback(async () => {
    try {
      const res = await fetch('/api/platos')
      const data = await res.json()
      setPlatos(data)
    } catch { /* ignore */ }
  }, [])

  const fetchBolsones = useCallback(async () => {
    try {
      const res = await fetch('/api/bolsones')
      const data = await res.json()
      setBolsones(data)
    } catch { /* ignore */ }
  }, [])

  useEffect(() => {
    fetchPedidos()
    fetchDashboard()
    fetchConsumidores()
    fetchPlatos()
    fetchBolsones()
  }, [fetchPedidos, fetchDashboard, fetchConsumidores, fetchPlatos, fetchBolsones])

  // Auto-calculate total
  useEffect(() => {
    if (formTipo === 'PLATO') {
      const plato = platos.find((p) => p.id === formItemId)
      setFormTotal((plato?.precio || 0) * formCantidad)
    } else {
      const bolson = bolsones.find((b) => b.id === formItemId)
      setFormTotal((bolson?.precio || 0) * formCantidad)
    }
  }, [formTipo, formItemId, formCantidad, platos, bolsones])

  const openCreate = () => {
    setFormConsumidor('')
    setFormTipo('PLATO')
    setFormItemId('')
    setFormCantidad(1)
    setFormNotas('')
    setFormTotal(0)
    setDialogOpen(true)
  }

  const handleCreate = async () => {
    if (!formConsumidor || !formItemId) {
      toast({ title: 'Completá consumidor y producto', variant: 'destructive' })
      return
    }
    try {
      const res = await fetch('/api/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          consumidorId: formConsumidor,
          tipo: formTipo,
          platoId: formTipo === 'PLATO' ? formItemId : null,
          bolsonId: formTipo === 'BOLSON' ? formItemId : null,
          cantidad: formCantidad,
          notas: formNotas || null,
          total: formTotal,
        }),
      })
      if (!res.ok) throw new Error()
      toast({ title: 'Pedido creado', description: 'El ticket fue generado correctamente' })
      setDialogOpen(false)
      fetchPedidos()
      fetchDashboard()
    } catch {
      toast({ title: 'Error al crear pedido', variant: 'destructive' })
    }
  }

  const advanceEstado = async (pedido: Pedido) => {
    const next = NEXT_ESTADO[pedido.estado]
    if (!next) return
    try {
      const res = await fetch(`/api/pedidos/${pedido.id}/estado`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: next }),
      })
      if (!res.ok) throw new Error()
      toast({ title: `Estado: ${next}` })
      fetchPedidos()
      fetchDashboard()
    } catch {
      toast({ title: 'Error al cambiar estado', variant: 'destructive' })
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      const res = await fetch(`/api/pedidos/${deleteId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      toast({ title: 'Pedido eliminado' })
      setDeleteId(null)
      fetchPedidos()
      fetchDashboard()
    } catch {
      toast({ title: 'Error al eliminar', variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-4">
      {/* Dashboard Stats */}
      {dashboard && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="border-emerald-200 bg-emerald-50/50">
            <CardContent className="p-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                <Package className="w-5 h-5 text-emerald-700" />
              </div>
              <div>
                <p className="text-2xl font-bold text-emerald-800">{dashboard.totalPlatos}</p>
                <p className="text-xs text-emerald-600">Platos activos</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-amber-200 bg-amber-50/50">
            <CardContent className="p-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <Package className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-800">{dashboard.totalBolsones}</p>
                <p className="text-xs text-amber-600">Bolsones activos</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-sky-200 bg-sky-50/50">
            <CardContent className="p-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-sky-100 flex items-center justify-center">
                <Users className="w-5 h-5 text-sky-700" />
              </div>
              <div>
                <p className="text-2xl font-bold text-sky-800">{dashboard.totalConsumidores}</p>
                <p className="text-xs text-sky-600">Consumidores</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-orange-200 bg-orange-50/50">
            <CardContent className="p-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-orange-700" />
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-800">{dashboard.pedidosHoy}</p>
                <p className="text-xs text-orange-600">Pedidos hoy</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Estado summary bar */}
      {dashboard && (
        <div className="flex gap-2 flex-wrap">
          <div className="text-xs text-gray-500 py-1">Pedidos:</div>
          {ESTADOS.filter(e => e.value).map((e) => (
            <Badge key={e.value} variant="secondary" className={e.color}>
              {e.label}: {dashboard.pedidosPorEstado[e.value] || 0}
            </Badge>
          ))}
        </div>
      )}

      <Separator />

      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-1.5">
          {ESTADOS.map((est) => {
            const Icon = est.icon
            return (
              <button
                key={est.value}
                onClick={() => setEstadoFilter(est.value)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                  estadoFilter === est.value
                    ? 'bg-emerald-700 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {est.label}
              </button>
            )
          })}
        </div>
        <Button onClick={openCreate} className="bg-emerald-700 hover:bg-emerald-800 text-white w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Pedido
        </Button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && pedidos.length === 0 && (
        <div className="text-center py-16 text-gray-500">
          <p className="text-lg">No hay pedidos</p>
          <p className="text-sm mt-1">
            {estadoFilter ? 'No hay pedidos con ese estado' : 'Creá el primer pedido con el botón de arriba'}
          </p>
        </div>
      )}

      {/* Pedidos List */}
      <AnimatePresence>
        <div className="space-y-3">
          {pedidos.map((pedido) => (
            <motion.div
              key={pedido.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="hover:shadow-sm transition-shadow">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    {/* Ticket number and main info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono font-bold text-gray-400">
                          #{pedido.id.slice(-5).toUpperCase()}
                        </span>
                        <Badge variant="secondary" className={ESTADO_BADGE[pedido.estado] || ''}>
                          {pedido.estado.replace('_', ' ')}
                        </Badge>
                        <Badge variant="outline">
                          {pedido.tipo === 'PLATO' ? 'Plato' : 'Bolsón'}
                        </Badge>
                      </div>
                      <div className="mt-1.5 flex items-center gap-3 flex-wrap">
                        <span className="font-semibold text-sm">{pedido.consumidor?.nombre || '—'}</span>
                        <span className="text-gray-500 text-sm">
                          {pedido.tipo === 'PLATO' ? pedido.plato?.nombre : pedido.bolson?.nombre}
                        </span>
                        <span className="text-gray-400 text-xs">x{pedido.cantidad}</span>
                      </div>
                      {pedido.notas && (
                        <p className="text-xs text-gray-400 mt-1 italic">{pedido.notas}</p>
                      )}
                    </div>

                    {/* Right side: price, date, actions */}
                    <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                      <div className="text-right">
                        <p className="text-lg font-bold text-emerald-700">{formatPrice(pedido.total)}</p>
                        <p className="text-xs text-gray-400">{formatDate(pedido.createdAt)}</p>
                      </div>
                      <div className="flex gap-1">
                        {NEXT_ESTADO[pedido.estado] && (
                          <Button
                            size="sm"
                            onClick={() => advanceEstado(pedido)}
                            className="bg-emerald-700 hover:bg-emerald-800 text-white h-8"
                          >
                            {NEXT_ESTADO[pedido.estado] === 'EN_PREPARACION' && <ChefHat className="w-3.5 h-3.5 mr-1" />}
                            {NEXT_ESTADO[pedido.estado] === 'LISTO' && <CheckCircle2 className="w-3.5 h-3.5 mr-1" />}
                            {NEXT_ESTADO[pedido.estado] === 'ENTREGADO' && <Truck className="w-3.5 h-3.5 mr-1" />}
                            <span className="hidden sm:inline">Avanzar</span>
                            <ChevronRight className="w-3.5 h-3.5 sm:hidden" />
                          </Button>
                        )}
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => setDeleteId(pedido.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </AnimatePresence>

      {/* Create Pedido Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nuevo Pedido</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Consumidor *</Label>
              <Select value={formConsumidor} onValueChange={setFormConsumidor}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar consumidor" />
                </SelectTrigger>
                <SelectContent>
                  {consumidores.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.nombre} {c.telefono ? `(${c.telefono})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tipo *</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={formTipo === 'PLATO' ? 'default' : 'outline'}
                  className={formTipo === 'PLATO' ? 'bg-emerald-700 hover:bg-emerald-800' : ''}
                  onClick={() => { setFormTipo('PLATO'); setFormItemId('') }}
                >
                  Plato
                </Button>
                <Button
                  type="button"
                  variant={formTipo === 'BOLSON' ? 'default' : 'outline'}
                  className={formTipo === 'BOLSON' ? 'bg-emerald-700 hover:bg-emerald-800' : ''}
                  onClick={() => { setFormTipo('BOLSON'); setFormItemId('') }}
                >
                  Bolsón
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>{formTipo === 'PLATO' ? 'Plato' : 'Bolsón'} *</Label>
              <Select value={formItemId} onValueChange={setFormItemId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={`Seleccionar ${formTipo === 'PLATO' ? 'plato' : 'bolsón'}`} />
                </SelectTrigger>
                <SelectContent>
                  {formTipo === 'PLATO'
                    ? platos.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.nombre} — {formatPrice(p.precio)}
                        </SelectItem>
                      ))
                    : bolsones.map((b) => (
                        <SelectItem key={b.id} value={b.id}>
                          {b.nombre} — {formatPrice(b.precio)}
                        </SelectItem>
                      ))
                  }
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Cantidad</Label>
                <Input
                  type="number"
                  min={1}
                  value={formCantidad || ''}
                  onChange={(e) => setFormCantidad(Number(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-2">
                <Label>Total</Label>
                <div className="h-9 px-3 flex items-center rounded-md border bg-gray-50">
                  <span className="font-bold text-emerald-700">{formatPrice(formTotal)}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Notas</Label>
              <Textarea
                value={formNotas}
                onChange={(e) => setFormNotas(e.target.value)}
                placeholder="Notas del pedido..."
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleCreate} className="bg-emerald-700 hover:bg-emerald-800 text-white">
              Crear Pedido
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar pedido?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El pedido y su ticket serán eliminados.
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