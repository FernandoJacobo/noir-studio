import { describe, expect, it } from 'vitest'
import type { WeeklySchedule } from '~~/types'
import { createSeed } from '~/data'
import { findConflict, fitsSchedule } from '~/utils/availability'
import { addDaysISO, toISODate } from '~/utils/time'

const h = (hh: number) => hh * 60
const hours: WeeklySchedule = {
  0: [{ start: h(10), end: h(15) }],
  1: null,
  2: [{ start: h(10), end: h(20) }],
  3: [{ start: h(10), end: h(20) }],
  4: [{ start: h(10), end: h(20) }],
  5: [{ start: h(10), end: h(20) }],
  6: [{ start: h(10), end: h(20) }],
}

const config = {
  brand: { name: 'NOIR Studio', phone: '', whatsapp: '', email: '', address: '', folioPrefix: 'NS' },
  businessHours: hours,
  booking: { slotInterval: 15, bufferMinutes: 0, minAdvanceMinutes: 60, maxDaysAhead: 45, accent: '#C9B38A' },
}

describe('datos semilla', () => {
  for (const now of [new Date(2026, 9, 7, 13, 0), new Date(2026, 0, 4, 9, 0), new Date(2026, 5, 15, 19, 30)]) {
    const seed = createSeed(now, config)
    const today = toISODate(now)

    it(`${today}: ~40 citas entre la semana pasada y las próximas dos semanas`, () => {
      const from = addDaysISO(today, -7)
      const to = addDaysISO(today, 14)
      const visible = seed.appointments.filter(a => a.date >= from && a.date <= to)
      expect(visible.length).toBeGreaterThanOrEqual(30)
      expect(visible.length).toBeLessThanOrEqual(55)
      const statuses = new Set(visible.map(a => a.status))
      for (const s of ['pending', 'confirmed', 'completed']) expect(statuses).toContain(s)
    })

    it(`${today}: sin traslapes y dentro del horario de cada profesional`, () => {
      for (const a of seed.appointments) {
        expect(findConflict(seed.appointments, a)).toBeUndefined()
        const member = seed.staff.find(m => m.id === a.staffId)!
        expect(fitsSchedule(member, hours, a.date, a.start, a.duration)).toBe(true)
        expect(a.serviceIds.every(id => member.serviceIds.includes(id))).toBe(true)
      }
    })

    it(`${today}: las citas futuras no están completadas`, () => {
      for (const a of seed.appointments.filter(a => a.date > today)) {
        expect(['pending', 'confirmed', 'cancelled']).toContain(a.status)
      }
    })
  }

  it('8 servicios, 4 profesionales y 25 clientes', () => {
    const seed = createSeed(new Date(), config)
    expect(seed.services).toHaveLength(8)
    expect(seed.staff).toHaveLength(4)
    expect(seed.clients).toHaveLength(25)
    for (const s of seed.services) {
      expect(s.price).toBeGreaterThanOrEqual(180)
      expect(s.price).toBeLessThanOrEqual(650)
      expect(s.duration).toBeGreaterThanOrEqual(30)
      expect(s.duration).toBeLessThanOrEqual(90)
    }
  })
})
