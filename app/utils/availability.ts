import type { Appointment, AppointmentStatus, ISODate, Minutes, Slot, StaffMember, TimeRange, WeeklySchedule } from '~~/types'
import { addDaysISO, diffDaysISO, minutesOfDay, rangesOverlap, toISODate, weekdayOf } from './time'

/** Estados que ocupan la agenda. Una cita cancelada libera su horario. */
export const BLOCKING_STATUSES: readonly AppointmentStatus[] = ['pending', 'confirmed', 'completed', 'no_show']

export function isBlocking(status: AppointmentStatus): boolean {
  return BLOCKING_STATUSES.includes(status)
}

/** Intersección de dos listas de rangos (cada lista ordenada y sin traslapes). */
export function intersectRanges(a: TimeRange[], b: TimeRange[]): TimeRange[] {
  const out: TimeRange[] = []
  for (const x of a) {
    for (const y of b) {
      const start = Math.max(x.start, y.start)
      const end = Math.min(x.end, y.end)
      if (end > start) out.push({ start, end })
    }
  }
  return out.sort((p, q) => p.start - q.start)
}

/** Rangos en los que un profesional trabaja una fecha dada, recortados al horario del negocio. */
export function getWorkingRanges(member: StaffMember, businessHours: WeeklySchedule, date: ISODate): TimeRange[] {
  if (!member.active || member.daysOff.includes(date)) return []
  const day = weekdayOf(date)
  const business = businessHours[day]
  const own = member.schedule[day]
  if (!business?.length || !own?.length) return []
  return intersectRanges(business, own)
}

export function canPerformAll(member: StaffMember, serviceIds: string[]): boolean {
  return serviceIds.every(id => member.serviceIds.includes(id))
}

export interface AvailabilityInput {
  date: ISODate
  /** Duración total de los servicios seleccionados. */
  duration: Minutes
  serviceIds: string[]
  /** Un profesional específico o `'any'` para cualquiera disponible. */
  staffId: string
  staff: StaffMember[]
  businessHours: WeeklySchedule
  appointments: Appointment[]
  now: Date
  interval?: number
  buffer?: number
  minAdvance?: number
  maxDaysAhead?: number
  /** Ignora esta cita al calcular (útil al reagendar). */
  excludeAppointmentId?: string
}

/**
 * Calcula los horarios disponibles para una fecha:
 * horario del negocio ∩ horario del profesional − citas existentes (+ margen) − duración total,
 * en intervalos fijos y nunca en el pasado ni antes de la anticipación mínima.
 */
export function getAvailableSlots(input: AvailabilityInput): Slot[] {
  const {
    date, duration, serviceIds, staffId, staff, businessHours, appointments, now,
    interval = 15, buffer = 0, minAdvance = 0, maxDaysAhead = Infinity, excludeAppointmentId,
  } = input

  if (duration <= 0 || interval <= 0) return []

  const today = toISODate(now)
  const daysFromToday = diffDaysISO(date, today)
  if (daysFromToday < 0 || daysFromToday > maxDaysAhead) return []

  // Primer minuto reservable (solo aplica hoy… o mañana si la anticipación cruza la medianoche).
  const earliestAbsolute = minutesOfDay(now) + minAdvance - daysFromToday * 1440

  const candidates = staff.filter(m =>
    m.active
    && (staffId === 'any' || m.id === staffId)
    && canPerformAll(m, serviceIds),
  )

  const slotMap = new Map<Minutes, string[]>()
  const load = new Map<string, number>()

  for (const member of candidates) {
    const ranges = getWorkingRanges(member, businessHours, date)
    if (!ranges.length) continue

    const busy = appointments
      .filter(a => a.staffId === member.id && a.date === date && a.id !== excludeAppointmentId && isBlocking(a.status))
      .map(a => ({ start: a.start, end: a.start + a.duration + buffer }))

    load.set(member.id, busy.length)

    for (const range of ranges) {
      let t = Math.ceil(range.start / interval) * interval
      for (; t + duration <= range.end; t += interval) {
        if (t < earliestAbsolute) continue
        const end = t + duration + buffer
        if (busy.some(b => rangesOverlap(t, end, b.start, b.end))) continue
        const list = slotMap.get(t)
        if (list) list.push(member.id)
        else slotMap.set(t, [member.id])
      }
    }
  }

  return [...slotMap.entries()]
    .sort(([a], [b]) => a - b)
    .map(([start, ids]) => ({
      start,
      // Prioriza al profesional con menos carga del día para repartir el trabajo.
      staffIds: ids.sort((a, b) => (load.get(a) ?? 0) - (load.get(b) ?? 0)),
    }))
}

/** Busca el siguiente horario disponible a partir de hoy. */
export function findNextAvailable(
  input: Omit<AvailabilityInput, 'date'>,
  searchDays = 14,
): { date: ISODate, slot: Slot } | null {
  const today = toISODate(input.now)
  for (let i = 0; i <= searchDays; i++) {
    const date = addDaysISO(today, i)
    const slots = getAvailableSlots({ ...input, date })
    if (slots[0]) return { date, slot: slots[0] }
  }
  return null
}

export interface ConflictCandidate {
  id?: string
  staffId: string
  date: ISODate
  start: Minutes
  duration: Minutes
}

/** Devuelve la cita con la que choca el candidato (mismo profesional, mismo día, horario traslapado). */
export function findConflict(appointments: Appointment[], candidate: ConflictCandidate): Appointment | undefined {
  return appointments.find(a =>
    a.id !== candidate.id
    && a.staffId === candidate.staffId
    && a.date === candidate.date
    && isBlocking(a.status)
    && rangesOverlap(candidate.start, candidate.start + candidate.duration, a.start, a.start + a.duration),
  )
}

/** ¿El bloque cabe completo dentro del horario laboral del profesional? */
export function fitsSchedule(member: StaffMember, businessHours: WeeklySchedule, date: ISODate, start: Minutes, duration: Minutes): boolean {
  return getWorkingRanges(member, businessHours, date).some(r => start >= r.start && start + duration <= r.end)
}

export type DayPeriod = 'morning' | 'afternoon' | 'evening'

export const PERIOD_LABELS: Record<DayPeriod, string> = {
  morning: 'Mañana',
  afternoon: 'Tarde',
  evening: 'Noche',
}

export function periodOf(min: Minutes): DayPeriod {
  if (min < 12 * 60) return 'morning'
  if (min < 18 * 60) return 'afternoon'
  return 'evening'
}

export function groupSlotsByPeriod(slots: Slot[]): { period: DayPeriod, label: string, slots: Slot[] }[] {
  const groups: Record<DayPeriod, Slot[]> = { morning: [], afternoon: [], evening: [] }
  for (const s of slots) groups[periodOf(s.start)].push(s)
  return (Object.keys(groups) as DayPeriod[]).map(period => ({ period, label: PERIOD_LABELS[period], slots: groups[period] }))
}

/** Rango [apertura, cierre] más amplio de toda la semana (para dibujar la agenda). */
export function weekBounds(hours: WeeklySchedule): TimeRange {
  let start = Infinity
  let end = -Infinity
  for (const day of Object.values(hours)) {
    for (const r of day ?? []) {
      start = Math.min(start, r.start)
      end = Math.max(end, r.end)
    }
  }
  return Number.isFinite(start) ? { start, end } : { start: 9 * 60, end: 20 * 60 }
}

/** Estado de apertura en vivo: "Abierto ahora · Cierra a las 8:00 p. m." */
export function openStatus(hours: WeeklySchedule, now: Date): { open: boolean, closesAt?: Minutes, opensAt?: { date: ISODate, start: Minutes } } {
  const today = toISODate(now)
  const nowMin = minutesOfDay(now)
  const todayRanges = hours[weekdayOf(today)] ?? []
  const current = todayRanges.find(r => nowMin >= r.start && nowMin < r.end)
  if (current) return { open: true, closesAt: current.end }
  for (let i = 0; i < 8; i++) {
    const date = addDaysISO(today, i)
    const next = (hours[weekdayOf(date)] ?? []).find(r => i > 0 || r.start > nowMin)
    if (next) return { open: false, opensAt: { date, start: next.start } }
  }
  return { open: false }
}

export interface LaidOutEvent {
  id: string
  /** Columna asignada dentro del grupo de traslape. */
  col: number
  /** Número total de columnas del grupo. */
  cols: number
}

/** Distribuye eventos traslapados en columnas (para la agenda). */
export function layoutOverlaps(events: { id: string, start: number, end: number }[]): Map<string, LaidOutEvent> {
  const sorted = [...events].sort((a, b) => a.start - b.start || b.end - a.end)
  const result = new Map<string, LaidOutEvent>()
  let group: { id: string, col: number }[] = []
  let colEnds: number[] = []
  let groupEnd = -Infinity

  const flush = () => {
    for (const g of group) result.set(g.id, { id: g.id, col: g.col, cols: colEnds.length })
    group = []
    colEnds = []
  }

  for (const ev of sorted) {
    if (ev.start >= groupEnd) {
      flush()
      groupEnd = -Infinity
    }
    let col = colEnds.findIndex(end => end <= ev.start)
    if (col === -1) {
      col = colEnds.length
      colEnds.push(ev.end)
    }
    else {
      colEnds[col] = ev.end
    }
    group.push({ id: ev.id, col })
    groupEnd = Math.max(groupEnd, ev.end)
  }
  flush()
  return result
}
