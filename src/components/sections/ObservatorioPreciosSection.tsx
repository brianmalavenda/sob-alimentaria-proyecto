'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Search,
  LineChart as LineChartIcon,
  History,
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { useToast } from '@/hooks/use-toast'

interface ResumenItem {
  ingredienteId: string
  nombre: string
  categoria: string
  unidad: string
  precioActual: number
  precioInicioRango: number
  variacion: number
  variacionPct: number
  cantidadCambios: number
  ultimaActualizacion: string
  tieneHistorial: boolean
}

interface TramoHistorial {
  id: string
  fecha: string
  precio: number
  precioAnterior: number | null
  variacion: number | null
  variacionPct: number | null
  motivo: string | null
  usuario: string | null
}

interface DetalleIngrediente {
  ingrediente: {
    id: string
    nombre: string
    categoria: string
    unidad: string
    precioActual: number
  }
  rango: { desde: string; hasta: string; dias: number }
  resumen: {
    precioInicial: number
    precioFinal: number
    variacion: number
    variacionPct: number
    cantidadCambios: number
  } | null
  historial: TramoHistorial[]
}

const RANGOS = [
  { value: '7', label: 'Últimos 7 días' },
  { value: '30', label: 'Últimos 30 días' },
  { value: '60', label: 'Últimos 60 días' },
  { value: '90', label: 'Últimos 90 días' },
  { value: '180', label: 'Últimos 180 días' },
  { value: '3650', label: 'Todo el historial' },
]

const formatPrice = (n: number) => `$${Math.round(n).toLocaleString('es-AR')}`
const formatDate = (d: string | Date) => format(new Date(d), "d 'de' MMM yyyy", { locale: es })
const formatDateShort = (d: string | Date) => format(new Date(d), 'dd/MM/yy', { locale: es })

function VariacionBadge({ pct, size = 'md' }: { pct: number; size?: 'sm' | 'md' }) {
  const sube = pct > 0.05
  const baja = pct < -0.05
  const Icon = sube ? TrendingUp : baja ? TrendingDown : Minus
  const color = sube
    ? 'bg-red-100 text-red-700'
    : baja
      ? 'bg-emerald-100 text-emerald-700'
      : 'bg-gray-100 text-gray-600'
  return (
    <Badge variant="secondary" className={`${color} gap-1 ${size === 'sm' ? 'text-xs' : ''}`}>
      <Icon className="w-3 h-3" />
      {pct > 0 ? '+' : ''}
      {pct.toFixed(1)}%
    </Badge>
  )
}

export default function ObservatorioPreciosSection() {
  const { toast } = useToast()
  const [items, setItems] = useState<ResumenItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('Todas')
  const [rango, setRango] = useState('30')

  const [detalleOpen, setDetalleOpen] = useState(false)
  const [detalle, setDetalle] = useState<DetalleIngrediente | null>(null)
  const [detalleLoading, setDetalleLoading] = useState(false)
  const [detalleIngId, setDetalleIngId] = useState<string | null>(null)

  const fetchResumen = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ days: rango })
      if (search) params.set('search', search)
      if (catFilter !== 'Todas') params.set('categoria', catFilter)
      const res = await fetch(`/api/historial-precios?${params.toString()}`)
      if (!res.ok) throw new Error()
      const data = await res.json()
      setItems(data.items)
    } catch {
      toast({ title: 'Error al cargar el observatorio de precios', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [rango, search, catFilter, toast])

  useEffect(() => {
    fetchResumen()
  }, [fetchResumen])

  const fetchDetalle = useCallback(async (ingredienteId: string, dias: string) => {
    setDetalleLoading(true)
    try {
      const res = await fetch(`/api/historial-precios/${ingredienteId}?days=${dias}`)
      if (!res.ok) throw new Error()
      const data = await res.json()
      setDetalle(data)
    } catch {
      toast({ title: 'Error al cargar el historial del ingrediente', variant: 'destructive' })
    } finally {
      setDetalleLoading(false)
    }
  }, [toast])

  const openDetalle = (ingredienteId: string) => {
    setDetalleIngId(ingredienteId)
    setDetalleOpen(true)
    fetchDetalle(ingredienteId, rango)
  }

  // Si cambia el rango general mientras el detalle está abierto, lo refresca
  useEffect(() => {
    if (detalleOpen && detalleIngId) {
      fetchDetalle(detalleIngId, rango)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rango])

  const categorias = useMemo(
    () => ['Todas', ...Array.from(new Set(items.map((i) => i.categoria)))],
    [items]
  )

  const stats = useMemo(() => {
    if (items.length === 0) return null
    const conCambios = items.filter((i) => i.cantidadCambios > 0)
    const mayorAumento = [...items].sort((a, b) => b.variacionPct - a.variacionPct)[0]
    const mayorBaja = [...items].sort((a, b) => a.variacionPct - b.variacionPct)[0]
    const promedio =
      items.reduce((acc, i) => acc + i.variacionPct, 0) / items.length
    return { conCambios: conCambios.length, mayorAumento, mayorBaja, promedio }
  }, [items])

  const chartData = useMemo(() => {
    if (!detalle) return []
    return detalle.historial.map((t) => ({
      fecha: t.fecha,
      fechaLabel: formatDateShort(t.fecha),
      precio: t.precio,
    }))
  }, [detalle])

  return (
    <div className="space-y-4">
      {/* Resumen */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500 mb-1">Ingredientes con cambios</p>
            <p className="text-xl font-bold text-gray-900">{stats.conCambios} / {items.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500 mb-1">Mayor aumento</p>
            <p className="text-sm font-semibold text-gray-900 truncate">{stats.mayorAumento.nombre}</p>
            <VariacionBadge pct={stats.mayorAumento.variacionPct} size="sm" />
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500 mb-1">Mayor baja</p>
            <p className="text-sm font-semibold text-gray-900 truncate">{stats.mayorBaja.nombre}</p>
            <VariacionBadge pct={stats.mayorBaja.variacionPct} size="sm" />
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500 mb-1">Variación promedio</p>
            <p className={`text-xl font-bold ${stats.promedio > 0 ? 'text-red-600' : stats.promedio < 0 ? 'text-emerald-600' : 'text-gray-900'}`}>
              {stats.promedio > 0 ? '+' : ''}{stats.promedio.toFixed(1)}%
            </p>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Buscar ingrediente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={catFilter} onValueChange={setCatFilter}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categorias.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={rango} onValueChange={setRango}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {RANGOS.map((r) => (
              <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tabla */}
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ingrediente</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Precio inicio del rango</TableHead>
                  <TableHead>Precio actual</TableHead>
                  <TableHead>Variación</TableHead>
                  <TableHead className="text-center">Cambios</TableHead>
                  <TableHead>Última actualización</TableHead>
                  <TableHead className="text-right">Historial</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence>
                  {items.map((item) => (
                    <motion.tr
                      key={item.ingredienteId}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="border-b last:border-0 hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => openDetalle(item.ingredienteId)}
                    >
                      <TableCell className="font-medium">{item.nombre}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                          {item.categoria}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-500">
                        {formatPrice(item.precioInicioRango)}
                        <span className="text-gray-400"> /{item.unidad}</span>
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatPrice(item.precioActual)}
                        <span className="text-gray-400 font-normal"> /{item.unidad}</span>
                      </TableCell>
                      <TableCell>
                        <VariacionBadge pct={item.variacionPct} />
                      </TableCell>
                      <TableCell className="text-center">
                        {item.cantidadCambios > 0 ? (
                          <Badge variant="secondary" className="bg-sky-100 text-sky-700">
                            {item.cantidadCambios}
                          </Badge>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-gray-500 text-sm">
                        {formatDate(item.ultimaActualizacion)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="icon" variant="ghost" className="h-8 w-8">
                          <LineChartIcon className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </motion.tr>
                  ))}
                </AnimatePresence>
                {items.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-400">
                      No se encontraron ingredientes para este filtro
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Dialog de detalle: línea de precios de un producto */}
      <Dialog open={detalleOpen} onOpenChange={setDetalleOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="w-4 h-4 text-emerald-700" />
              {detalle?.ingrediente.nombre || 'Historial de precio'}
            </DialogTitle>
          </DialogHeader>

          {detalleLoading || !detalle ? (
            <div className="space-y-3 py-4">
              <Skeleton className="h-40 w-full rounded-lg" />
              <Skeleton className="h-24 w-full rounded-lg" />
            </div>
          ) : (
            <div className="space-y-4">
              {detalle.resumen && (
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Precio actual</p>
                    <p className="text-lg font-bold text-emerald-700">
                      {formatPrice(detalle.ingrediente.precioActual)}
                      <span className="text-xs text-gray-400 font-normal"> /{detalle.ingrediente.unidad}</span>
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Variación del período</p>
                    <VariacionBadge pct={detalle.resumen.variacionPct} />
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Cambios registrados</p>
                    <p className="text-lg font-bold">{detalle.resumen.cantidadCambios}</p>
                  </div>
                </div>
              )}

              {chartData.length > 0 ? (
                <div className="bg-white border border-gray-100 rounded-lg p-2">
                  <ChartContainer
                    config={{ precio: { label: 'Precio', color: '#047857' } }}
                    className="h-56 w-full"
                  >
                    <LineChart data={chartData} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="fechaLabel" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v) => `$${Number(v).toLocaleString('es-AR')}`}
                        width={64}
                      />
                      <ChartTooltip
                        content={
                          <ChartTooltipContent
                            formatter={(value) => [formatPrice(Number(value)), 'Precio']}
                          />
                        }
                      />
                      <Line
                        type="stepAfter"
                        dataKey="precio"
                        stroke="var(--color-precio)"
                        strokeWidth={2}
                        dot={{ r: 3, fill: 'var(--color-precio)' }}
                        activeDot={{ r: 5 }}
                      />
                    </LineChart>
                  </ChartContainer>
                </div>
              ) : (
                <p className="text-sm text-gray-400 text-center py-6">
                  Sin cambios de precio registrados en este período
                </p>
              )}

              {/* Tabla de tramos: la "línea" de auditoría pedida por producto */}
              <div className="border border-gray-100 rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vigente desde</TableHead>
                      <TableHead>Precio</TableHead>
                      <TableHead>Variación</TableHead>
                      <TableHead>Motivo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {detalle.historial.map((t) => (
                      <TableRow key={t.id}>
                        <TableCell className="text-sm">{formatDate(t.fecha)}</TableCell>
                        <TableCell className="font-medium">{formatPrice(t.precio)}</TableCell>
                        <TableCell>
                          {t.variacionPct !== null ? (
                            <VariacionBadge pct={t.variacionPct} size="sm" />
                          ) : (
                            <Badge variant="secondary" className="bg-gray-100 text-gray-600 text-xs">
                              Precio inicial
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">{t.motivo || '—'}</TableCell>
                      </TableRow>
                    ))}
                    {detalle.historial.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-6 text-gray-400">
                          Sin tramos registrados en este período
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
