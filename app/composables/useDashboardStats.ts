import type { Appointment, ISODate } from '~~/types'

const counts = (a: Appointment) => a.status !== 'cancelled'
const earns = (a: Appointment) => a.status !== 'cancelled' && a.status !== 'no_show'

/** Métricas del dashboard calculadas a partir de los stores. */
export function useDashboardStats() {
  const appointments = useAppointmentsStore()
  const clients = useClientsStore()
  const staff = useStaffStore()
  const services = useServicesStore()
  const settings = useSettingsStore()
  const now = useNowTicker()

  const today = computed(() => toISODate(now.value))
  const weekStart = computed(() => startOfWeekISO(today.value))
  const prevWeekStart = computed(() => addDaysISO(weekStart.value, -7))

  const inRange = (a: Appointment, from: ISODate, days: number) => a.date >= from && a.date <= addDaysISO(from, days - 1)

  const todayCount = computed(() => appointments.items.filter(a => a.date === today.value && counts(a)).length)
  const lastWeekSameDay = computed(() => appointments.items.filter(a => a.date === addDaysISO(today.value, -7) && counts(a)).length)

  const weekRevenue = computed(() => appointments.items.filter(a => inRange(a, weekStart.value, 7) && earns(a)).reduce((s, a) => s + a.price, 0))
  const prevWeekRevenue = computed(() => appointments.items.filter(a => inRange(a, prevWeekStart.value, 7) && earns(a)).reduce((s, a) => s + a.price, 0))

  function occupancy(from: ISODate) {
    let capacity = 0
    for (let i = 0; i < 7; i++) {
      const date = addDaysISO(from, i)
      for (const m of staff.active) {
        for (const r of getWorkingRanges(m, settings.settings.hours, date)) capacity += r.end - r.start
      }
    }
    const booked = appointments.items.filter(a => inRange(a, from, 7) && counts(a)).reduce((s, a) => s + a.duration, 0)
    return capacity ? Math.round((booked / capacity) * 100) : 0
  }
  const weekOccupancy = computed(() => occupancy(weekStart.value))
  const prevWeekOccupancy = computed(() => occupancy(prevWeekStart.value))

  const daysAgo = (iso: string) => (now.value.getTime() - new Date(iso).getTime()) / 86_400_000
  const newClients = computed(() => clients.items.filter(c => daysAgo(c.createdAt) <= 7).length)
  const prevNewClients = computed(() => clients.items.filter(c => daysAgo(c.createdAt) > 7 && daysAgo(c.createdAt) <= 14).length)

  /** Serie diaria de los últimos 30 días (incluye hoy). */
  const series = computed(() => {
    const from = addDaysISO(today.value, -29)
    return Array.from({ length: 30 }, (_, i) => {
      const date = addDaysISO(from, i)
      const day = appointments.items.filter(a => a.date === date)
      return {
        date,
        count: day.filter(counts).length,
        revenue: day.filter(earns).reduce((s, a) => s + a.price, 0),
      }
    })
  })

  const topServices = computed(() => {
    const from = addDaysISO(today.value, -29)
    const tally = new Map<string, number>()
    for (const a of appointments.items) {
      if (a.date < from || a.date > today.value || !counts(a)) continue
      for (const id of a.serviceIds) tally.set(id, (tally.get(id) ?? 0) + 1)
    }
    const max = Math.max(1, ...tally.values())
    return [...tally.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id, count]) => ({ service: services.get(id), count, share: count / max }))
      .filter(x => x.service)
  })

  const todayAppointments = computed(() => appointments.forDate(today.value).filter(counts))

  return {
    today, todayCount, lastWeekSameDay, weekRevenue, prevWeekRevenue,
    weekOccupancy, prevWeekOccupancy, newClients, prevNewClients, series, topServices, todayAppointments,
  }
}
