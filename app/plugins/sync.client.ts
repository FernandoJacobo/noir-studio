import { toast } from 'vue-sonner'
import type { Appointment } from '~~/types'

/**
 * Sincroniza los stores entre pestañas con el evento `storage`.
 * Una reserva hecha en el sitio público aparece al instante en la agenda del panel abierta en otra pestaña.
 */
export default defineNuxtPlugin(() => {
  const router = useRouter()
  const appointments = useAppointmentsStore()
  const clients = useClientsStore()

  const stores: Record<string, { $hydrate: () => void }> = {
    'noir-appointments': appointments,
    'noir-clients': clients,
    'noir-services': useServicesStore(),
    'noir-staff': useStaffStore(),
    'noir-settings': useSettingsStore(),
    'noir-auth': useAuthStore(),
  }

  window.addEventListener('storage', (event) => {
    if (!event.key || !event.newValue || !(event.key in stores)) return

    if (event.key !== 'noir-appointments') {
      stores[event.key]!.$hydrate()
      return
    }

    const before = new Map(appointments.items.map(a => [a.id, a]))
    appointments.$hydrate()
    // El cliente puede ser nuevo: hidrata también clientes para resolver su nombre.
    clients.$hydrate()

    if (!router.currentRoute.value.path.startsWith('/admin')) return

    const added = appointments.items.filter(a => !before.has(a.id))
    const changed = appointments.items.filter((a) => {
      const prev = before.get(a.id)
      return prev && (prev.status !== a.status || prev.date !== a.date || prev.start !== a.start)
    })

    for (const a of added) notify(a, 'Nueva cita')
    for (const a of changed) notify(a, a.status === 'cancelled' ? 'Cita cancelada' : 'Cita actualizada')
  })

  function notify(a: Appointment, title: string) {
    const client = clients.get(a.clientId)
    toast(title, {
      description: `${client?.name ?? 'Cliente'} · ${formatDateShort(a.date)}, ${formatTime(a.start)}`,
      action: {
        label: 'Ver',
        onClick: () => router.push({ path: '/admin/agenda', query: { date: a.date, cita: a.id } }),
      },
    })
  }
})
