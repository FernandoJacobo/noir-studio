import type { Appointment, AppointmentSource, AppointmentStatus, Client, Service, StaffMember, WeeklySchedule } from '~~/types'
import { getAvailableSlots } from '../utils/availability'
import { createRandom } from '../utils/misc'
import { generateFolio } from '../utils/folio'
import { addDaysISO, minutesOfDay, parseISODate, toISODate } from '../utils/time'

interface SeedContext {
  services: Service[]
  staff: StaffMember[]
  clients: Client[]
  hours: WeeklySchedule
  folioPrefix: string
}

/** Combinaciones de servicios más comunes (con peso relativo). */
const BOOKING_PATTERNS: { ids: string[], weight: number }[] = [
  { ids: ['srv_corte'], weight: 8 },
  { ids: ['srv_fade'], weight: 7 },
  { ids: ['srv_corte_barba'], weight: 6 },
  { ids: ['srv_barba'], weight: 3 },
  { ids: ['srv_afeitado'], weight: 2 },
  { ids: ['srv_ritual'], weight: 2 },
  { ids: ['srv_facial'], weight: 3 },
  { ids: ['srv_canas'], weight: 1 },
  { ids: ['srv_corte', 'srv_canas'], weight: 1 },
  { ids: ['srv_fade', 'srv_barba'], weight: 2 },
]

function pickWeighted<T extends { weight: number }>(items: T[], rnd: () => number): T {
  const total = items.reduce((s, i) => s + i.weight, 0)
  let r = rnd() * total
  for (const item of items) {
    r -= item.weight
    if (r <= 0) return item
  }
  return items[items.length - 1]!
}

function pick<T>(items: T[], rnd: () => number): T {
  return items[Math.floor(rnd() * items.length)]!
}

function statusFor(kind: 'past' | 'today-past' | 'future', rnd: () => number): AppointmentStatus {
  const r = rnd()
  if (kind === 'past') return r < 0.8 ? 'completed' : r < 0.9 ? 'cancelled' : 'no_show'
  if (kind === 'today-past') return r < 0.9 ? 'completed' : 'no_show'
  return r < 0.55 ? 'confirmed' : r < 0.9 ? 'pending' : 'cancelled'
}

/**
 * Genera citas semilla relativas a `now`:
 * - ~40 citas entre la semana pasada, hoy y las próximas dos semanas (las que se ven en la agenda).
 * - Historial ligero de los 30 días previos para alimentar las gráficas del dashboard.
 * Se construyen con el mismo motor de disponibilidad, así que nunca hay traslapes.
 */
export function createSeedAppointments(now: Date, ctx: SeedContext): Appointment[] {
  const rnd = createRandom(20261007)
  const today = toISODate(now)
  const nowMin = minutesOfDay(now)
  const priceOf = new Map(ctx.services.map(s => [s.id, s]))
  const result: Appointment[] = []

  for (let offset = -30; offset <= 14; offset++) {
    const date = addDaysISO(today, offset)
    const dow = parseISODate(date).getDay() as keyof WeeklySchedule
    if (!ctx.hours[dow]?.length) continue

    let target: number
    if (offset < -7) target = 2 + Math.floor(rnd() * 3) // historial
    else if (offset < 0) target = 2 + Math.floor(rnd() * 2)
    else if (offset === 0) target = 5
    else if (offset <= 7) target = 1 + Math.floor(rnd() * 3)
    else target = 1 + Math.floor(rnd() * 2)

    // Para generar citas pasadas se calcula como si fuera el inicio de ese día.
    const reference = parseISODate(date)

    for (let n = 0; n < target; n++) {
      const pattern = pickWeighted(BOOKING_PATTERNS, rnd)
      const services = pattern.ids.map(id => priceOf.get(id)).filter((s): s is Service => !!s)
      const duration = services.reduce((s, x) => s + x.duration, 0)
      const slots = getAvailableSlots({
        date,
        duration,
        serviceIds: pattern.ids,
        staffId: 'any',
        staff: ctx.staff,
        businessHours: ctx.hours,
        appointments: result,
        now: reference,
        interval: 15,
      }).filter(s => s.start % 30 === 0) // las citas reales suelen caer en medias horas
      if (!slots.length) continue

      // Hoy: reparte citas antes y después de la hora actual para que la agenda se vea viva.
      let pool = slots
      if (offset === 0) {
        const before = slots.filter(s => s.start + duration <= nowMin)
        const after = slots.filter(s => s.start >= nowMin)
        pool = (n % 2 === 0 ? after : before).length ? (n % 2 === 0 ? after : before) : slots
      }
      const slot = pick(pool, rnd)
      const staffId = pick(slot.staffIds, rnd)
      const client = pick(ctx.clients, rnd)

      let status: AppointmentStatus
      if (offset < 0) status = statusFor('past', rnd)
      else if (offset === 0 && slot.start + duration <= nowMin) status = statusFor('today-past', rnd)
      else if (offset === 0) status = rnd() < 0.75 ? 'confirmed' : 'pending'
      else status = statusFor('future', rnd)

      const source: AppointmentSource = rnd() < 0.7 ? 'online' : rnd() < 0.66 ? 'admin' : 'walk_in'
      const created = new Date(reference.getTime() - Math.floor(rnd() * 6 + 1) * 86_400_000 + slot.start * 60_000)

      result.push({
        id: `apt_seed_${result.length + 1}`,
        folio: generateFolio(ctx.folioPrefix, rnd),
        clientId: client.id,
        staffId,
        serviceIds: pattern.ids,
        date,
        start: slot.start,
        duration,
        price: services.reduce((s, x) => s + x.price, 0),
        status,
        notes: rnd() < 0.15 ? 'Pidió confirmar por WhatsApp.' : undefined,
        source,
        createdAt: created.toISOString(),
        updatedAt: created.toISOString(),
      })
    }
  }

  return result.sort((a, b) => a.date.localeCompare(b.date) || a.start - b.start)
}
