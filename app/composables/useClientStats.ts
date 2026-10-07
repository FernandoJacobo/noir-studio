import type { Client } from '~~/types'

/** Estadísticas de cada cliente a partir de su historial. */
export function useClientStats() {
  const appointments = useAppointmentsStore()
  const now = useNowTicker()

  const byClient = computed(() => {
    const today = toISODate(now.value)
    const map = new Map<string, { visits: number, spent: number, last?: string, next?: string }>()
    for (const a of appointments.sorted) {
      const s = map.get(a.clientId) ?? { visits: 0, spent: 0 }
      if (a.status === 'completed') {
        s.visits++
        s.spent += a.price
        s.last = a.date
      }
      if (a.date >= today && (a.status === 'pending' || a.status === 'confirmed') && !s.next) s.next = a.date
      map.set(a.clientId, s)
    }
    return map
  })

  function statsOf(client: Client) {
    const s = byClient.value.get(client.id) ?? { visits: 0, spent: 0 }
    return { ...s, totalVisits: client.baseVisits + s.visits }
  }

  return { statsOf }
}
