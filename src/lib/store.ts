import { create } from 'zustand'

type Section = 'platos' | 'ingredientes' | 'bolsones' | 'ticketera'

interface AppState {
  activeSection: Section
  sidebarOpen: boolean
  setActiveSection: (section: Section) => void
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
}

export const useAppStore = create<AppState>((set) => ({
  activeSection: 'platos',
  sidebarOpen: true,
  setActiveSection: (section) => set({ activeSection: section, sidebarOpen: false }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}))