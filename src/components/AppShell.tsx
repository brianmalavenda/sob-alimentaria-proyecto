'use client'

import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  UtensilsCrossed,
  Carrot,
  Package,
  Ticket,
  Menu,
  X,
  Store,
} from 'lucide-react'
import PlatosSection from '@/components/sections/PlatosSection'
import IngredientesSection from '@/components/sections/IngredientesSection'
import BolsonesSection from '@/components/sections/BolsonesSection'
import TicketeraSection from '@/components/sections/TicketeraSection'
import { motion, AnimatePresence } from 'framer-motion'

const navItems = [
  { id: 'platos' as const, label: 'Platos', icon: UtensilsCrossed },
  { id: 'ingredientes' as const, label: 'Ingredientes', icon: Carrot },
  { id: 'bolsones' as const, label: 'Bolsones', icon: Package },
  { id: 'ticketera' as const, label: 'Ticketera', icon: Ticket },
]

export default function AppShell() {
  const { activeSection, sidebarOpen, setActiveSection, toggleSidebar, setSidebarOpen } = useAppStore()

  const handleNavClick = (id: typeof activeSection) => {
    setActiveSection(id)
    setSidebarOpen(false)
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-emerald-800 text-white flex flex-col transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-emerald-600 rounded-lg flex items-center justify-center">
              <Store className="w-5 h-5 text-emerald-100" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">ComidasApp</h1>
              <p className="text-emerald-300 text-xs">Gestión Interna</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-white hover:bg-emerald-700 hover:text-white h-8 w-8"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <Separator className="bg-emerald-700" />

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activeSection === item.id
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-emerald-100 hover:bg-emerald-700/60 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {item.label}
              </button>
            )
          })}
        </nav>

        <Separator className="bg-emerald-700" />

        {/* Footer */}
        <div className="p-4 mt-auto">
          <div className="flex items-center gap-2 text-emerald-300 text-xs">
            <Store className="w-4 h-4" />
            <span>Gestión de Comidas</span>
          </div>
          <p className="text-emerald-400/60 text-xs mt-1">
            Sistema interno de administración
          </p>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-h-screen flex flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 shadow-sm">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden h-9 w-9"
            onClick={toggleSidebar}
          >
            <Menu className="w-5 h-5" />
          </Button>
          <div>
            <h2 className="font-semibold text-lg text-gray-900">
              {navItems.find((i) => i.id === activeSection)?.label}
            </h2>
            <p className="text-xs text-gray-500">
              {activeSection === 'platos' && 'Gestioná tus platos del menú'}
              {activeSection === 'ingredientes' && 'Administrá insumos y actualizá precios'}
              {activeSection === 'bolsones' && 'Gestioná bolsones por tipo de cliente'}
              {activeSection === 'ticketera' && 'Pedidos y tickets de entrega'}
            </p>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {activeSection === 'platos' && <PlatosSection />}
              {activeSection === 'ingredientes' && <IngredientesSection />}
              {activeSection === 'bolsones' && <BolsonesSection />}
              {activeSection === 'ticketera' && <TicketeraSection />}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Sticky footer */}
        <footer className="border-t border-gray-200 bg-white px-4 py-3 mt-auto">
          <p className="text-xs text-gray-400 text-center">
            ComidasApp © {new Date().getFullYear()} — Sistema de gestión interna
          </p>
        </footer>
      </div>
    </div>
  )
}