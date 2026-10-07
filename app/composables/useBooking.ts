import { z } from 'zod'
import { toast } from 'vue-sonner'

export const bookingFormSchema = z.object({
  name: z.string().trim().min(3, 'Escribe tu nombre completo').max(60, 'Máximo 60 caracteres'),
  phone: z.string().trim().refine(v => v.replace(/\D/g, '').length === 10, 'Debe tener 10 dígitos (ej. 33 1234 5678)'),
  email: z.string().trim().email('Correo no válido'),
  notes: z.string().max(300, 'Máximo 300 caracteres'),
})

export type BookingFormErrors = Partial<Record<keyof z.infer<typeof bookingFormSchema>, string>>

/** Estado derivado y acciones del wizard de reservación. */
export function useBooking() {
  const booking = useBookingStore()
  const services = useServicesStore()
  const staff = useStaffStore()
  const clients = useClientsStore()
  const appointments = useAppointmentsStore()

  const selectedServices = computed(() => services.resolve(booking.serviceIds).filter(s => s.active))
  const totals = computed(() => services.totals(selectedServices.value.map(s => s.id)))
  const capableStaff = computed(() => staff.capableOf(booking.serviceIds))
  const chosenStaff = computed(() => (booking.staffId && booking.staffId !== 'any' ? staff.get(booking.staffId) : undefined))
  const assignedStaff = computed(() => (booking.assignedStaffId ? staff.get(booking.assignedStaffId) : undefined))

  const formErrors = computed<BookingFormErrors>(() => {
    const result = bookingFormSchema.safeParse(booking.form)
    if (result.success) return {}
    const errors: BookingFormErrors = {}
    for (const issue of result.error.issues) {
      const key = issue.path[0] as keyof BookingFormErrors
      errors[key] ??= issue.message
    }
    return errors
  })

  /** ¿Cada paso tiene lo necesario? */
  const stepValid = computed(() => [
    selectedServices.value.length > 0,
    !!booking.staffId && (booking.staffId === 'any' ? capableStaff.value.length > 0 : capableStaff.value.some(m => m.id === booking.staffId)),
    !!booking.date && booking.start !== null && !!booking.assignedStaffId,
    Object.keys(formErrors.value).length === 0,
    true,
  ])

  const canAdvance = computed(() => stepValid.value[booking.step] ?? false)

  function canVisit(step: number) {
    return stepValid.value.slice(0, step).every(Boolean)
  }

  const direction = ref<'forward' | 'back'>('forward')

  function goTo(step: number) {
    if (step === booking.step || !canVisit(step)) return
    direction.value = step > booking.step ? 'forward' : 'back'
    booking.step = step
    if (import.meta.client) window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const next = () => goTo(booking.step + 1)
  const back = () => goTo(booking.step - 1)

  /** Si el borrador quedó inconsistente (servicio desactivado, profesional eliminado…) lo corrige. */
  function sanitize() {
    const validIds = booking.serviceIds.filter(id => services.get(id)?.active)
    if (validIds.length !== booking.serviceIds.length) booking.serviceIds = validIds
    if (booking.staffId && booking.staffId !== 'any' && !capableStaff.value.some(m => m.id === booking.staffId)) booking.staffId = null
    while (booking.step > 0 && !canVisit(booking.step)) booking.step--
  }

  const submitting = ref(false)

  /** Crea cliente + cita. Devuelve el id de la cita o `null` si el horario ya se ocupó. */
  async function confirm(): Promise<string | null> {
    if (!stepValid.value.slice(0, 4).every(Boolean)) return null
    submitting.value = true
    // Pequeña latencia simulada para que el estado de carga se perciba.
    await new Promise(r => setTimeout(r, 650))
    try {
      const client = clients.upsert(booking.form)
      const appointment = appointments.create({
        clientId: client.id,
        staffId: booking.assignedStaffId!,
        serviceIds: selectedServices.value.map(s => s.id),
        date: booking.date!,
        start: booking.start!,
        duration: totals.value.duration,
        price: totals.value.price,
        notes: booking.form.notes.trim() || undefined,
        source: 'online',
        status: 'pending',
      })
      booking.startNew()
      return appointment.id
    }
    catch (error) {
      if (error instanceof ConflictError) {
        toast.error('Ese horario se acaba de ocupar', { description: 'Elige otro horario disponible.' })
        booking.clearSlot()
        direction.value = 'back'
        booking.step = 2
        return null
      }
      throw error
    }
    finally {
      submitting.value = false
    }
  }

  return {
    booking, selectedServices, totals, capableStaff, chosenStaff, assignedStaff,
    formErrors, stepValid, canAdvance, canVisit, direction, goTo, next, back, sanitize, confirm, submitting,
  }
}
