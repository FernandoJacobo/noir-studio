<script setup lang="ts">
import type { ISODate, Minutes, Slot } from '~~/types'

/** Calendario + cuadrícula de horarios. Se usa en el wizard y al reagendar. */
const props = defineProps<{
  serviceIds: string[]
  staffId: string
  excludeAppointmentId?: string
  start: Minutes | null
}>()
const emit = defineEmits<{ select: [{ date: ISODate, start: Minutes, staffId: string }] }>()
const date = defineModel<ISODate | null>('date', { default: null })

const settings = useSettingsStore()
const appointments = useAppointmentsStore()
const staff = useStaffStore()
const { slotsFor, now } = useAvailability()

const today = computed(() => toISODate(now.value))
const maxDate = computed(() => addDaysISO(today.value, settings.settings.maxDaysAhead))

// Caché de horarios por día: el calendario consulta cada día del mes.
// Se invalida cuando cambia cualquier dato que afecte la disponibilidad.
const slotCache = computed(() => {
  void [props.serviceIds.join(), props.staffId, now.value, JSON.stringify(settings.settings), JSON.stringify(staff.items)]
  void appointments.items.map(a => `${a.id}${a.status}${a.date}${a.start}${a.staffId}`).join()
  return new Map<ISODate, Slot[]>()
})

function slotsOf(d: ISODate): Slot[] {
  const cache = slotCache.value
  if (!cache.has(d)) cache.set(d, slotsFor({ date: d, serviceIds: props.serviceIds, staffId: props.staffId, excludeAppointmentId: props.excludeAppointmentId }))
  return cache.get(d)!
}

const isAvailable = (d: ISODate) => slotsOf(d).length > 0
const slotCount = (d: ISODate) => slotsOf(d).length

// Si no hay fecha elegida (o ya no tiene horarios), salta al primer día disponible.
onMounted(() => {
  if (date.value && isAvailable(date.value)) return
  for (let i = 0; i <= settings.settings.maxDaysAhead; i++) {
    const d = addDaysISO(today.value, i)
    if (isAvailable(d)) {
      date.value = d
      return
    }
  }
})

const daySlots = computed(() => (date.value ? slotsOf(date.value) : []))

// Skeleton breve al cambiar de día: da sensación de "consulta" y suaviza el cambio de contenido.
const loading = ref(false)
let timer: ReturnType<typeof setTimeout> | undefined
watch(date, () => {
  loading.value = true
  clearTimeout(timer)
  timer = setTimeout(() => (loading.value = false), 280)
})

function pick(slot: Slot) {
  if (!date.value) return
  emit('select', { date: date.value, start: slot.start, staffId: slot.staffIds[0]! })
}
</script>

<template>
  <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-8">
    <div class="surface-card p-4 sm:p-5">
      <BookingMonthCalendar v-model="date" :today="today" :max-date="maxDate" :is-available="isAvailable" :slot-count="slotCount" />
    </div>
    <div>
      <div class="mb-4 flex items-baseline justify-between gap-3">
        <p class="text-[15px] font-semibold tracking-tight first-letter:uppercase">
          {{ date ? formatDateLong(date) : 'Elige un día' }}
        </p>
        <p v-if="date && !loading" class="text-xs text-muted tabular-nums">
          {{ pluralize(daySlots.length, 'horario') }}
        </p>
      </div>
      <BookingSlotGrid :slots="daySlots" :selected="start" :loading="loading" @select="pick" />
    </div>
  </div>
</template>
