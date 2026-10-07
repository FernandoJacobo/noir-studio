import type { ISODate, Slot } from '~~/types'

interface SlotQuery {
  date: ISODate
  serviceIds: string[]
  staffId: string
  excludeAppointmentId?: string
  /** El panel puede agendar sin la anticipación mínima. */
  ignoreAdvance?: boolean
}

/** Puente entre las funciones puras de disponibilidad y los stores. */
export function useAvailability() {
  const settingsStore = useSettingsStore()
  const staffStore = useStaffStore()
  const servicesStore = useServicesStore()
  const appointmentsStore = useAppointmentsStore()
  const now = useNowTicker()

  function baseInput(serviceIds: string[], staffId: string, ignoreAdvance = false) {
    const s = settingsStore.settings
    return {
      duration: servicesStore.totals(serviceIds).duration,
      serviceIds,
      staffId,
      staff: staffStore.items,
      businessHours: s.hours,
      appointments: appointmentsStore.items,
      now: now.value,
      interval: s.slotInterval,
      buffer: s.bufferMinutes,
      minAdvance: ignoreAdvance ? 0 : s.minAdvanceMinutes,
      maxDaysAhead: s.maxDaysAhead,
    }
  }

  function slotsFor(q: SlotQuery): Slot[] {
    if (!q.serviceIds.length) return []
    return getAvailableSlots({ ...baseInput(q.serviceIds, q.staffId, q.ignoreAdvance), date: q.date, excludeAppointmentId: q.excludeAppointmentId })
  }

  function nextAvailable(serviceIds: string[], staffId = 'any', searchDays = 14) {
    if (!serviceIds.length) return null
    return findNextAvailable(baseInput(serviceIds, staffId), searchDays)
  }

  return { slotsFor, nextAvailable, now }
}
