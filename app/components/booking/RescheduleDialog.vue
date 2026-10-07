<script setup lang="ts">
import { toast } from 'vue-sonner'
import type { Appointment, ISODate, Minutes } from '~~/types'

const props = defineProps<{ appointment: Appointment }>()
const emit = defineEmits<{ done: [] }>()
const open = defineModel<boolean>('open', { default: false })

const { terms } = useAppConfig()
const appointments = useAppointmentsStore()
const staff = useStaffStore()

const anyStaff = ref(false)
const date = ref<ISODate | null>(props.appointment.date)
const choice = ref<{ date: ISODate, start: Minutes, staffId: string } | null>(null)

watch(open, (v) => {
  if (!v) return
  anyStaff.value = false
  date.value = props.appointment.date
  choice.value = null
})
watch([anyStaff, date], () => (choice.value = null))

const member = computed(() => staff.get(props.appointment.staffId))
const chosenMember = computed(() => (choice.value ? staff.get(choice.value.staffId) : undefined))

function save() {
  if (!choice.value) return
  try {
    appointments.reschedule(props.appointment.id, choice.value)
    toast.success('Cita reagendada', { description: `${capitalize(formatDateLong(choice.value.date))}, ${formatTime(choice.value.start)}` })
    open.value = false
    emit('done')
  }
  catch (e) {
    if (e instanceof ConflictError) toast.error('Ese horario ya no está disponible')
    else throw e
  }
}
</script>

<template>
  <UiDialog v-model:open="open" title="Reagendar cita" :description="`Folio ${appointment.folio} · ${formatDuration(appointment.duration)}`" size="xl">
    <div class="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-[10px] border border-border bg-surface-2/50 px-3.5 py-2.5 text-[13px]">
      <span class="flex items-center gap-2">
        <SharedAvatar v-if="member" :name="member.name" :src="member.photo" class="size-6 text-[9px]" />
        Mantener a <strong class="font-medium">{{ member?.name ?? 'mismo profesional' }}</strong>
      </span>
      <label class="flex items-center gap-2 text-muted">
        <UiSwitch v-model="anyStaff" :label="`Cualquier ${terms.professional}`" />
        Cualquier {{ terms.professional }}
      </label>
    </div>

    <BookingDateTimePicker
      v-if="open"
      v-model:date="date"
      :service-ids="appointment.serviceIds"
      :staff-id="anyStaff ? 'any' : appointment.staffId"
      :exclude-appointment-id="appointment.id"
      :start="choice?.start ?? null"
      @select="choice = $event"
    />

    <template #footer>
      <p v-if="choice" class="mr-auto self-center text-[13px] text-muted">
        Nuevo horario: <span class="font-medium text-foreground">{{ formatDateShort(choice.date) }} · {{ formatTime(choice.start) }}</span>
        <template v-if="chosenMember && chosenMember.id !== appointment.staffId">
          con {{ chosenMember.name }}
        </template>
      </p>
      <UiButton variant="outline" @click="open = false">
        Cancelar
      </UiButton>
      <UiButton :disabled="!choice" @click="save">
        Guardar cambio
      </UiButton>
    </template>
  </UiDialog>
</template>
