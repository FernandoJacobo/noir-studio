<script setup lang="ts">
import { toast } from 'vue-sonner'
import type { AppointmentStatus } from '~~/types'

/** Detalle de una cita en un panel lateral, con acciones rápidas. */
const props = defineProps<{ appointmentId: string | null }>()
const emit = defineEmits<{ close: [] }>()

const appointments = useAppointmentsStore()
const brand = useBrand()
const open = computed({
  get: () => !!props.appointmentId,
  set: v => !v && emit('close'),
})

const { apt, serviceList, member, client } = useAppointmentDetails(() => (props.appointmentId ? appointments.get(props.appointmentId) : undefined))
const rescheduleOpen = ref(false)
const cancelOpen = ref(false)

const actions: { status: AppointmentStatus, label: string, icon: string }[] = [
  { status: 'confirmed', label: 'Confirmar', icon: 'lucide:circle-check' },
  { status: 'completed', label: 'Completar', icon: 'lucide:check-check' },
  { status: 'no_show', label: 'No asistió', icon: 'lucide:user-x' },
]

function setStatus(status: AppointmentStatus) {
  if (!apt.value) return
  appointments.setStatus(apt.value.id, status)
  toast.success(`Cita marcada como ${STATUS_META[status].label.toLowerCase()}`)
}

const clientWhatsapp = computed(() => {
  if (!apt.value || !client.value) return '#'
  return whatsappUrl(client.value.phone, `Hola ${client.value.name.split(' ')[0]}, te escribimos de ${brand.value.name} para confirmar tu cita del ${formatDateLong(apt.value.date)} a las ${formatTime(apt.value.start)}.`)
})

const sourceLabel = { online: 'Reserva en línea', admin: 'Creada en el panel', walk_in: 'Sin cita (walk-in)' } as const
</script>

<template>
  <UiSheet v-model:open="open" :title="apt ? (client?.name ?? 'Cita') : 'Cita'" :description="apt ? `Folio ${apt.folio}` : undefined">
    <template v-if="apt" #eyebrow>
      <SharedStatusBadge :status="apt.status" class="mb-2" />
    </template>

    <div v-if="apt" class="space-y-6">
      <div class="rounded-[12px] border border-border bg-surface-2/40 p-4">
        <p class="text-xs uppercase tracking-wider text-muted">
          {{ formatDateFns(apt.date, 'EEEE') }}
        </p>
        <p class="text-display text-3xl leading-tight first-letter:uppercase">
          {{ formatDateFns(apt.date, "d 'de' MMMM") }}
        </p>
        <p class="mt-0.5 text-[15px] font-semibold tabular-nums">
          {{ formatTimeRange(apt.start, apt.duration) }}
          <span class="text-[13px] font-normal text-muted">· {{ formatDuration(apt.duration) }}</span>
        </p>
      </div>

      <dl class="space-y-3 text-[13px]">
        <div class="flex items-center justify-between gap-3">
          <dt class="text-muted">
            Profesional
          </dt>
          <dd class="flex items-center gap-2 font-medium">
            <SharedAvatar v-if="member" :name="member.name" :src="member.photo" class="size-6 text-[9px]" />
            {{ member?.name ?? '—' }}
          </dd>
        </div>
        <div class="flex items-start justify-between gap-3">
          <dt class="text-muted">
            Servicios
          </dt>
          <dd class="text-right">
            <p v-for="s in serviceList" :key="s.id">
              {{ s.name }}
            </p>
          </dd>
        </div>
        <div class="flex items-center justify-between gap-3">
          <dt class="text-muted">
            Total
          </dt>
          <dd class="font-semibold tabular-nums">
            {{ formatPrice(apt.price) }}
          </dd>
        </div>
        <div class="flex items-center justify-between gap-3">
          <dt class="text-muted">
            Origen
          </dt>
          <dd>{{ sourceLabel[apt.source] }}</dd>
        </div>
        <div v-if="apt.notes" class="rounded-[10px] border border-border p-3">
          <dt class="mb-1 text-xs text-muted">
            Notas de la cita
          </dt>
          <dd>{{ apt.notes }}</dd>
        </div>
      </dl>

      <div v-if="client" class="rounded-[12px] border border-border p-4">
        <div class="flex items-center gap-3">
          <SharedAvatar :name="client.name" class="size-9" />
          <div class="min-w-0 flex-1">
            <NuxtLink :to="`/admin/clientes/${client.id}`" class="text-[13px] font-medium hover:underline" @click="emit('close')">
              {{ client.name }}
            </NuxtLink>
            <p class="truncate text-xs text-muted">
              {{ formatPhone(client.phone) }} · {{ client.email }}
            </p>
          </div>
          <UiTooltip content="Escribir por WhatsApp">
            <UiButton :href="clientWhatsapp" target="_blank" variant="outline" size="icon-sm" aria-label="Escribir por WhatsApp">
              <Icon name="lucide:message-circle" class="size-4" />
            </UiButton>
          </UiTooltip>
        </div>
        <p v-if="client.notes" class="mt-3 border-t border-border pt-3 text-xs leading-relaxed text-muted">
          {{ client.notes }}
        </p>
      </div>

      <div>
        <p class="mb-2 text-xs font-medium uppercase tracking-wider text-muted">
          Acciones rápidas
        </p>
        <div class="grid grid-cols-3 gap-2">
          <UiButton
            v-for="a in actions"
            :key="a.status"
            variant="secondary"
            size="sm"
            :disabled="apt.status === a.status || apt.status === 'cancelled'"
            class="flex-col gap-1 py-2 h-auto"
            @click="setStatus(a.status)"
          >
            <Icon :name="a.icon" class="size-4" />
            {{ a.label }}
          </UiButton>
        </div>
      </div>
    </div>

    <template v-if="apt" #footer>
      <div class="flex gap-2">
        <UiButton variant="outline" class="flex-1" @click="rescheduleOpen = true">
          <Icon name="lucide:calendar-clock" class="size-4" />
          Reagendar
        </UiButton>
        <UiButton v-if="apt.status !== 'cancelled'" variant="danger" class="flex-1" @click="cancelOpen = true">
          <Icon name="lucide:x" class="size-4" />
          Cancelar
        </UiButton>
      </div>
      <BookingRescheduleDialog v-model:open="rescheduleOpen" :appointment="apt" />
      <UiConfirmDialog
        v-model:open="cancelOpen"
        title="¿Cancelar esta cita?"
        :description="`${client?.name ?? 'Cliente'} · ${formatDateShort(apt.date)}, ${formatTime(apt.start)}. El horario quedará libre.`"
        confirm-label="Cancelar cita"
        cancel-label="Volver"
        destructive
        @confirm="setStatus('cancelled')"
      />
    </template>
  </UiSheet>
</template>
