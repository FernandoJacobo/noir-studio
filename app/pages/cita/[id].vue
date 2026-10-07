<script setup lang="ts">
import { toast } from 'vue-sonner'

const route = useRoute()
const appointments = useAppointmentsStore()
const id = computed(() => String(route.params.id))
const isNew = computed(() => route.query.nueva === '1')

const { apt, serviceList, member, client, googleUrl, whatsappLink } = useAppointmentDetails(() => appointments.get(id.value))

useSeoMeta({ title: () => (apt.value ? `Cita ${apt.value.folio}` : 'Cita no encontrada'), robots: 'noindex' })

const now = useNowTicker()
const isPast = computed(() => !!apt.value && toDateTime(apt.value.date, apt.value.start) < now.value)
const cancelled = computed(() => apt.value?.status === 'cancelled')
const editable = computed(() => !!apt.value && !isPast.value && ['pending', 'confirmed'].includes(apt.value.status))

const rescheduleOpen = ref(false)
const cancelOpen = ref(false)

function cancel() {
  if (!apt.value) return
  appointments.setStatus(apt.value.id, 'cancelled')
  toast('Cita cancelada', { description: 'Liberamos tu horario. ¡Te esperamos pronto!' })
}

function reactivate() {
  rescheduleOpen.value = true
}

const headline = computed(() => {
  if (cancelled.value) return 'Cita cancelada'
  if (isNew.value) return '¡Listo, tu cita está reservada!'
  if (apt.value?.status === 'completed') return 'Cita completada'
  return 'Tu cita'
})
</script>

<template>
  <div class="mx-auto max-w-3xl px-4 pb-20 pt-28 sm:px-6 sm:pt-32">
    <SharedEmptyState
      v-if="!apt"
      icon="lucide:calendar-search"
      title="No encontramos esta cita"
      description="Es posible que el enlace sea incorrecto o que el demo se haya restablecido."
      class="surface-card"
    >
      <UiButton to="/reservar">
        Reservar una cita
      </UiButton>
    </SharedEmptyState>

    <template v-else>
      <div class="mb-10 flex flex-col items-center text-center">
        <SharedSuccessCheck v-if="!cancelled" />
        <div v-else class="grid size-20 place-items-center rounded-full border border-border bg-surface-2">
          <Icon name="lucide:calendar-x" class="size-8 text-muted" />
        </div>
        <h1 class="mt-5 text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
          {{ headline }}
        </h1>
        <p class="mt-2 max-w-md text-[15px] text-muted">
          <template v-if="cancelled">
            Esta cita ya no está activa. Puedes elegir un nuevo horario cuando quieras.
          </template>
          <template v-else-if="isNew">
            Te enviamos los detalles por WhatsApp a {{ client ? formatPhone(client.phone) : 'tu número' }}. Guarda tu folio.
          </template>
          <template v-else>
            Aquí puedes agregarla a tu calendario, reagendarla o cancelarla.
          </template>
        </p>
        <div class="mt-4 flex items-center gap-2">
          <SharedStatusBadge :status="apt.status" />
          <UiBadge class="font-mono">
            {{ apt.folio }}
          </UiBadge>
        </div>
      </div>

      <div :class="cn('transition-opacity', cancelled && 'opacity-60 grayscale')">
        <BookingTicket
          :services="serviceList"
          :staff="member"
          :date="apt.date"
          :start="apt.start"
          :duration="apt.duration"
          :price="apt.price"
          :client-name="client?.name"
          :folio="apt.folio"
        />
      </div>

      <div v-if="!cancelled && !isPast" class="mx-auto mt-8 grid max-w-md gap-2.5 sm:grid-cols-2">
        <UiButton :href="googleUrl" target="_blank" variant="secondary" class="w-full">
          <Icon name="lucide:calendar-plus" class="size-4" />
          Google Calendar
        </UiButton>
        <UiButton :href="whatsappLink" target="_blank" variant="secondary" class="w-full">
          <Icon name="lucide:message-circle" class="size-4" />
          WhatsApp
        </UiButton>
      </div>

      <div class="mx-auto mt-8 flex max-w-md flex-col items-center gap-3 border-t border-border pt-8 sm:flex-row sm:justify-center">
        <template v-if="editable">
          <UiButton variant="outline" class="w-full sm:w-auto" @click="rescheduleOpen = true">
            <Icon name="lucide:calendar-clock" class="size-4" />
            Reagendar
          </UiButton>
          <UiButton variant="ghost" class="w-full text-danger hover:bg-danger/10 hover:text-danger sm:w-auto" @click="cancelOpen = true">
            <Icon name="lucide:x" class="size-4" />
            Cancelar cita
          </UiButton>
        </template>
        <UiButton v-else-if="cancelled && !isPast" variant="outline" @click="reactivate">
          <Icon name="lucide:rotate-ccw" class="size-4" />
          Elegir nuevo horario
        </UiButton>
        <UiButton to="/" variant="ghost">
          Volver al inicio
        </UiButton>
      </div>

      <BookingRescheduleDialog v-model:open="rescheduleOpen" :appointment="apt" />
      <UiConfirmDialog
        v-model:open="cancelOpen"
        title="¿Cancelar tu cita?"
        :description="`${capitalize(formatDateLong(apt.date))} a las ${formatTime(apt.start)}. Liberaremos el horario para alguien más.`"
        confirm-label="Sí, cancelar"
        cancel-label="Conservar cita"
        destructive
        @confirm="cancel"
      />
    </template>
  </div>
</template>
