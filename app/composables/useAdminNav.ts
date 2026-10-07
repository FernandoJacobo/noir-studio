export interface AdminNavItem {
  to: string
  label: string
  icon: string
  /** Atajo secuencial "G + tecla". */
  key: string
}

/** Navegación del panel (sidebar, breadcrumb y paleta de comandos). */
export function useAdminNav() {
  const { terms } = useAppConfig()
  const items: AdminNavItem[] = [
    { to: '/admin', label: 'Dashboard', icon: 'lucide:layout-dashboard', key: 'd' },
    { to: '/admin/agenda', label: 'Agenda', icon: 'lucide:calendar-days', key: 'a' },
    { to: '/admin/citas', label: 'Citas', icon: 'lucide:list-checks', key: 'c' },
    { to: '/admin/clientes', label: 'Clientes', icon: 'lucide:users', key: 'l' },
    { to: '/admin/servicios', label: 'Servicios', icon: 'lucide:briefcase', key: 's' },
    { to: '/admin/equipo', label: terms.team, icon: 'lucide:user-round', key: 'e' },
    { to: '/admin/configuracion', label: 'Configuración', icon: 'lucide:settings', key: 'o' },
  ]

  const route = useRoute()
  const current = computed(() =>
    [...items].sort((a, b) => b.to.length - a.to.length).find(i => route.path === i.to || route.path.startsWith(`${i.to}/`)),
  )

  return { items, current }
}
