import type { Appointment, AppointmentSource, AppointmentStatus, ISODate, Minutes } from '~~/types'

export interface NewAppointmentInput {
  clientId: string
  staffId: string
  serviceIds: string[]
  date: ISODate
  start: Minutes
  duration: Minutes
  price: number
  notes?: string
  source: AppointmentSource
  status?: AppointmentStatus
}

export class ConflictError extends Error {
  constructor(public conflict: Appointment) {
    super('El horario se traslapa con otra cita')
  }
}

export const useAppointmentsStore = defineStore('noir-appointments', () => {
  const items = ref<Appointment[]>(structuredClone(useDemoSeed().appointments))

  const byId = computed(() => new Map(items.value.map(a => [a.id, a])))

  const sorted = computed(() =>
    [...items.value].sort((a, b) => a.date.localeCompare(b.date) || a.start - b.start),
  )

  function get(id: string) {
    return byId.value.get(id)
  }

  function forDate(date: ISODate) {
    return sorted.value.filter(a => a.date === date)
  }

  function forClient(clientId: string) {
    return sorted.value.filter(a => a.clientId === clientId)
  }

  function uniqueFolio(): string {
    const { brand } = useAppConfig()
    let folio = generateFolio(brand.folioPrefix)
    while (items.value.some(a => a.folio === folio)) folio = generateFolio(brand.folioPrefix)
    return folio
  }

  function create(input: NewAppointmentInput): Appointment {
    const conflict = findConflict(items.value, input)
    if (conflict) throw new ConflictError(conflict)
    const now = new Date().toISOString()
    const appointment: Appointment = {
      ...input,
      id: createId('apt'),
      folio: uniqueFolio(),
      status: input.status ?? 'pending',
      createdAt: now,
      updatedAt: now,
    }
    items.value.push(appointment)
    return appointment
  }

  function patch(id: string, data: Partial<Appointment>) {
    const i = items.value.findIndex(a => a.id === id)
    if (i === -1) return
    items.value[i] = { ...items.value[i]!, ...data, id, updatedAt: new Date().toISOString() }
  }

  function setStatus(id: string, status: AppointmentStatus) {
    patch(id, { status })
  }

  /** Mueve una cita validando traslapes. Lanza `ConflictError` si choca. */
  function reschedule(id: string, target: { date: ISODate, start: Minutes, staffId?: string }) {
    const current = get(id)
    if (!current) return
    const staffId = target.staffId ?? current.staffId
    const conflict = findConflict(items.value, { id, staffId, date: target.date, start: target.start, duration: current.duration })
    if (conflict) throw new ConflictError(conflict)
    patch(id, {
      date: target.date,
      start: target.start,
      staffId,
      // Una cita cancelada que se reagenda vuelve a quedar pendiente.
      status: current.status === 'cancelled' ? 'pending' : current.status,
    })
  }

  function reset(seed = useDemoSeed()) {
    items.value = structuredClone(seed.appointments)
  }

  return { items, byId, sorted, get, forDate, forClient, create, patch, setStatus, reschedule, reset }
}, { persist: true })
