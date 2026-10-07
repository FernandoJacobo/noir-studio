import type { ISODate, Minutes } from '~~/types'

export const BOOKING_STEPS = [
  { id: 'service', label: 'Servicio' },
  { id: 'staff', label: 'Profesional' },
  { id: 'datetime', label: 'Fecha y hora' },
  { id: 'details', label: 'Tus datos' },
  { id: 'confirm', label: 'Confirmación' },
] as const

export interface BookingForm {
  name: string
  phone: string
  email: string
  notes: string
}

const emptyForm = (): BookingForm => ({ name: '', phone: '', email: '', notes: '' })

/** Borrador del wizard de reservación (persistido para retomar si se recarga la página). */
export const useBookingStore = defineStore('noir-booking', () => {
  const step = ref(0)
  const serviceIds = ref<string[]>([])
  /** Id del profesional o `'any'`. `null` = aún no elige. */
  const staffId = ref<string | null>(null)
  const date = ref<ISODate | null>(null)
  const start = ref<Minutes | null>(null)
  /** Profesional asignado por el sistema cuando se elige "Cualquiera". */
  const assignedStaffId = ref<string | null>(null)
  const form = ref<BookingForm>(emptyForm())

  function toggleService(id: string) {
    serviceIds.value = serviceIds.value.includes(id)
      ? serviceIds.value.filter(s => s !== id)
      : [...serviceIds.value, id]
    clearSlot()
  }

  function setStaff(id: string) {
    staffId.value = id
    clearSlot()
  }

  function setSlot(d: ISODate, s: Minutes, assigned: string) {
    date.value = d
    start.value = s
    assignedStaffId.value = assigned
  }

  function clearSlot() {
    start.value = null
    assignedStaffId.value = null
  }

  /** Inicia un flujo nuevo, opcionalmente con un servicio preseleccionado. Conserva los datos de contacto. */
  function startNew(preselected?: string) {
    step.value = 0
    serviceIds.value = preselected ? [preselected] : []
    staffId.value = null
    date.value = null
    clearSlot()
  }

  function reset() {
    startNew()
    form.value = emptyForm()
  }

  return { step, serviceIds, staffId, date, start, assignedStaffId, form, toggleService, setStaff, setSlot, clearSlot, startNew, reset }
}, { persist: true })
