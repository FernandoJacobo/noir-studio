import { describe, expect, it } from 'vitest'
import type { Appointment, StaffMember, WeeklySchedule } from '~~/types'
import {
  findConflict,
  findNextAvailable,
  fitsSchedule,
  getAvailableSlots,
  groupSlotsByPeriod,
  intersectRanges,
  layoutOverlaps,
  openStatus,
} from '~/utils/availability'

const h = (hh: number, mm = 0) => hh * 60 + mm

// 2026-10-06 es martes, 2026-10-05 es lunes, 2026-10-11 es domingo.
const TUESDAY = '2026-10-06'
const MONDAY = '2026-10-05'
const SUNDAY = '2026-10-11'

const hours: WeeklySchedule = {
  0: [{ start: h(10), end: h(15) }],
  1: null,
  2: [{ start: h(10), end: h(20) }],
  3: [{ start: h(10), end: h(20) }],
  4: [{ start: h(10), end: h(20) }],
  5: [{ start: h(10), end: h(20) }],
  6: [{ start: h(10), end: h(20) }],
}

function member(id: string, overrides: Partial<StaffMember> = {}): StaffMember {
  return {
    id,
    name: id,
    role: '',
    bio: '',
    specialties: [],
    serviceIds: ['cut', 'beard', 'facial'],
    schedule: {
      0: [{ start: h(10), end: h(15) }],
      1: [{ start: h(10), end: h(20) }], // trabaja lunes, pero el negocio cierra
      2: [{ start: h(10), end: h(14) }, { start: h(15), end: h(20) }],
      3: [{ start: h(10), end: h(20) }],
      4: [{ start: h(10), end: h(20) }],
      5: [{ start: h(10), end: h(20) }],
      6: [{ start: h(10), end: h(20) }],
    },
    daysOff: [],
    active: true,
    ...overrides,
  }
}

function appt(overrides: Partial<Appointment>): Appointment {
  return {
    id: Math.random().toString(36),
    folio: 'NS-TEST',
    clientId: 'c1',
    staffId: 'ana',
    serviceIds: ['cut'],
    date: TUESDAY,
    start: h(11),
    duration: 60,
    price: 300,
    status: 'confirmed',
    source: 'online',
    createdAt: '',
    updatedAt: '',
    ...overrides,
  }
}

// "Ahora" = lunes anterior a las 9:00, para que el martes esté completo en el futuro.
const EARLY = new Date(2026, 9, 5, 9, 0)

const base = {
  date: TUESDAY,
  duration: 60,
  serviceIds: ['cut'],
  staffId: 'ana',
  staff: [member('ana')],
  businessHours: hours,
  appointments: [] as Appointment[],
  now: EARLY,
  interval: 15,
}

const starts = (slots: { start: number }[]) => slots.map(s => s.start)

describe('intersectRanges', () => {
  it('intersecta rangos y descarta los vacíos', () => {
    expect(intersectRanges([{ start: 600, end: 1200 }], [{ start: 540, end: 840 }, { start: 900, end: 1300 }]))
      .toEqual([{ start: 600, end: 840 }, { start: 900, end: 1200 }])
    expect(intersectRanges([{ start: 600, end: 700 }], [{ start: 700, end: 800 }])).toEqual([])
  })
})

describe('getAvailableSlots — cierres y descansos', () => {
  it('no ofrece horarios en días que el negocio cierra (lunes)', () => {
    expect(getAvailableSlots({ ...base, date: MONDAY })).toEqual([])
  })

  it('respeta el horario reducido del domingo', () => {
    const slots = getAvailableSlots({ ...base, date: SUNDAY })
    expect(slots[0]!.start).toBe(h(10))
    expect(slots.at(-1)!.start).toBe(h(14)) // 14:00 + 60 min = 15:00 (cierre)
  })

  it('excluye el descanso del profesional (comida de 14 a 15)', () => {
    const slots = starts(getAvailableSlots(base))
    expect(slots).toContain(h(13)) // 13:00–14:00 cabe justo
    expect(slots).not.toContain(h(13, 15)) // invadiría la comida
    expect(slots).not.toContain(h(14))
    expect(slots).not.toContain(h(14, 30))
    expect(slots).toContain(h(15))
  })

  it('nunca termina después del cierre', () => {
    const slots = starts(getAvailableSlots(base))
    expect(Math.max(...slots) + 60).toBeLessThanOrEqual(h(20))
    expect(slots).toContain(h(19))
    expect(slots).not.toContain(h(19, 15))
  })

  it('respeta días libres específicos del profesional', () => {
    const staff = [member('ana', { daysOff: [TUESDAY] })]
    expect(getAvailableSlots({ ...base, staff })).toEqual([])
  })

  it('ignora profesionales inactivos', () => {
    expect(getAvailableSlots({ ...base, staff: [member('ana', { active: false })] })).toEqual([])
  })

  it('genera intervalos de 15 minutos alineados', () => {
    const slots = starts(getAvailableSlots(base))
    expect(slots.slice(0, 4)).toEqual([h(10), h(10, 15), h(10, 30), h(10, 45)])
    expect(slots.every(s => s % 15 === 0)).toBe(true)
  })
})

describe('getAvailableSlots — citas existentes', () => {
  it('bloquea cualquier horario que se traslape con una cita', () => {
    const appointments = [appt({ start: h(11), duration: 60 })] // 11:00–12:00
    const slots = starts(getAvailableSlots({ ...base, appointments }))
    expect(slots).toContain(h(10)) // 10:00–11:00 termina justo cuando empieza la otra
    expect(slots).not.toContain(h(10, 15))
    expect(slots).not.toContain(h(11))
    expect(slots).not.toContain(h(11, 45))
    expect(slots).toContain(h(12))
  })

  it('las citas canceladas liberan el horario', () => {
    const appointments = [appt({ start: h(11), status: 'cancelled' })]
    expect(starts(getAvailableSlots({ ...base, appointments }))).toContain(h(11))
  })

  it('solo bloquea la agenda del profesional de la cita', () => {
    const appointments = [appt({ staffId: 'otro', start: h(11) })]
    expect(starts(getAvailableSlots({ ...base, appointments }))).toContain(h(11))
  })

  it('aplica el margen entre citas antes y después', () => {
    const appointments = [appt({ start: h(11), duration: 60 })]
    const slots = starts(getAvailableSlots({ ...base, appointments, buffer: 15 }))
    expect(slots).not.toContain(h(10)) // 10:00–11:00 + 15 min de margen chocaría
    expect(slots).not.toContain(h(12))
    expect(slots).toContain(h(12, 15))
  })

  it('ignora la cita que se está reagendando', () => {
    const appointments = [appt({ id: 'mover', start: h(11) })]
    const slots = starts(getAvailableSlots({ ...base, appointments, excludeAppointmentId: 'mover' }))
    expect(slots).toContain(h(11))
  })

  it('un hueco más corto que la duración no se ofrece', () => {
    // Huecos: 10:00–10:45 libre, luego ocupado
    const appointments = [appt({ start: h(10, 45), duration: 195 })] // hasta 14:00
    const slots = starts(getAvailableSlots({ ...base, appointments }))
    expect(slots.filter(s => s < h(14))).toEqual([])
  })
})

describe('getAvailableSlots — servicios combinados', () => {
  it('usa la duración total de los servicios', () => {
    // Corte (45) + barba (30) = 75 min. Antes de la comida, el último inicio posible es 12:45.
    const slots = starts(getAvailableSlots({ ...base, duration: 75, serviceIds: ['cut', 'beard'] }))
    expect(slots).toContain(h(12, 45))
    expect(slots).not.toContain(h(13))
    expect(slots).toContain(h(18, 45))
    expect(slots).not.toContain(h(19))
  })

  it('solo considera profesionales que hacen todos los servicios', () => {
    const staff = [member('ana', { serviceIds: ['cut'] })]
    expect(getAvailableSlots({ ...base, staff, serviceIds: ['cut', 'facial'] })).toEqual([])
  })
})

describe('getAvailableSlots — cualquier profesional', () => {
  it('une la disponibilidad de varios profesionales', () => {
    const staff = [member('ana'), member('beto')]
    const appointments = [appt({ staffId: 'ana', start: h(11) })]
    const slots = getAvailableSlots({ ...base, staff, staffId: 'any', appointments })
    const at11 = slots.find(s => s.start === h(11))!
    expect(at11.staffIds).toEqual(['beto'])
    // En la comida de Ana (martes 14–15) Beto también come, así que no hay nadie.
    expect(slots.find(s => s.start === h(14))).toBeUndefined()
  })

  it('prioriza al profesional con menos citas en el día', () => {
    const staff = [member('ana'), member('beto')]
    const appointments = [appt({ staffId: 'ana', start: h(18) })]
    const slots = getAvailableSlots({ ...base, staff, staffId: 'any', appointments })
    expect(slots[0]!.staffIds).toEqual(['beto', 'ana'])
  })
})

describe('getAvailableSlots — tiempo', () => {
  it('no permite horarios pasados ni dentro de la anticipación mínima', () => {
    const now = new Date(2026, 9, 6, 12, 10) // martes 12:10
    const slots = starts(getAvailableSlots({ ...base, duration: 30, now, minAdvance: 60 }))
    expect(slots[0]).toBe(h(13, 15)) // 12:10 + 60 = 13:10 → siguiente intervalo 13:15
  })

  it('no permite fechas pasadas', () => {
    const now = new Date(2026, 9, 7, 9, 0)
    expect(getAvailableSlots({ ...base, now })).toEqual([])
  })

  it('respeta el máximo de días hacia adelante', () => {
    expect(getAvailableSlots({ ...base, maxDaysAhead: 0 })).toEqual([])
  })

  it('la anticipación que cruza la medianoche afecta el día siguiente', () => {
    const now = new Date(2026, 9, 5, 23, 30) // lunes 23:30
    const slots = starts(getAvailableSlots({ ...base, now, minAdvance: 12 * 60 }))
    expect(slots[0]).toBe(h(11, 30))
  })
})

describe('findNextAvailable', () => {
  it('salta días cerrados y encuentra el siguiente horario', () => {
    const result = findNextAvailable({ ...base, now: new Date(2026, 9, 5, 9, 0) })
    expect(result).toEqual({ date: TUESDAY, slot: { start: h(10), staffIds: ['ana'] } })
  })
})

describe('findConflict y fitsSchedule', () => {
  const appointments = [appt({ id: 'a', start: h(11), duration: 60 })]

  it('detecta traslapes parciales y totales', () => {
    expect(findConflict(appointments, { staffId: 'ana', date: TUESDAY, start: h(11, 30), duration: 30 })?.id).toBe('a')
    expect(findConflict(appointments, { staffId: 'ana', date: TUESDAY, start: h(10, 30), duration: 120 })?.id).toBe('a')
  })

  it('no hay conflicto con citas contiguas, de otro profesional o la misma cita', () => {
    expect(findConflict(appointments, { staffId: 'ana', date: TUESDAY, start: h(12), duration: 30 })).toBeUndefined()
    expect(findConflict(appointments, { staffId: 'beto', date: TUESDAY, start: h(11), duration: 30 })).toBeUndefined()
    expect(findConflict(appointments, { id: 'a', staffId: 'ana', date: TUESDAY, start: h(11, 15), duration: 60 })).toBeUndefined()
  })

  it('valida que el bloque quepa en el horario laboral', () => {
    const ana = member('ana')
    expect(fitsSchedule(ana, hours, TUESDAY, h(13), 60)).toBe(true)
    expect(fitsSchedule(ana, hours, TUESDAY, h(13, 30), 60)).toBe(false)
    expect(fitsSchedule(ana, hours, MONDAY, h(12), 30)).toBe(false)
  })
})

describe('groupSlotsByPeriod', () => {
  it('agrupa en mañana, tarde y noche', () => {
    const groups = groupSlotsByPeriod([h(10), h(11, 45), h(12), h(17, 45), h(18), h(19)].map(start => ({ start, staffIds: [] })))
    expect(groups.map(g => g.slots.length)).toEqual([2, 2, 2])
    expect(groups.map(g => g.label)).toEqual(['Mañana', 'Tarde', 'Noche'])
  })
})

describe('openStatus', () => {
  it('abierto: indica la hora de cierre', () => {
    expect(openStatus(hours, new Date(2026, 9, 6, 12, 0))).toEqual({ open: true, closesAt: h(20) })
  })

  it('cerrado en lunes: abre el martes', () => {
    expect(openStatus(hours, new Date(2026, 9, 5, 12, 0))).toEqual({ open: false, opensAt: { date: TUESDAY, start: h(10) } })
  })

  it('antes de abrir: abre hoy mismo', () => {
    expect(openStatus(hours, new Date(2026, 9, 6, 8, 0))).toEqual({ open: false, opensAt: { date: TUESDAY, start: h(10) } })
  })
})

describe('layoutOverlaps', () => {
  it('reparte eventos traslapados en columnas', () => {
    const map = layoutOverlaps([
      { id: 'a', start: 600, end: 660 },
      { id: 'b', start: 630, end: 690 },
      { id: 'c', start: 660, end: 720 },
      { id: 'd', start: 800, end: 860 },
    ])
    expect(map.get('a')).toMatchObject({ col: 0, cols: 2 })
    expect(map.get('b')).toMatchObject({ col: 1, cols: 2 })
    expect(map.get('c')).toMatchObject({ col: 0, cols: 2 })
    expect(map.get('d')).toMatchObject({ col: 0, cols: 1 })
  })
})
