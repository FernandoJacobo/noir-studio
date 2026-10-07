<script setup lang="ts">
import { toast } from 'vue-sonner'
import type { AppointmentStatus, ISODate, Minutes } from '~~/types'

const ui = useUiStore()
const services = useServicesStore()
const staffStore = useStaffStore()
const clients = useClientsStore()
const appointments = useAppointmentsStore()
const router = useRouter()
const { slotsFor, now } = useAvailability()
const { terms } = useAppConfig()

const open = computed({
  get: () => ui.newAppointment.open,
  set: v => (ui.newAppointment = { ...ui.newAppointment, open: v }),
})

const clientMode = ref<'existing' | 'new'>('existing')
const clientSearch = ref('')
const clientId = ref<string | null>(null)
const newClient = reactive({ name: '', phone: '', email: '' })
const serviceIds = ref<string[]>([])
const staffId = ref<string>('')
const date = ref<ISODate>('')
const start = ref<Minutes | null>(null)
const status = ref<AppointmentStatus>('confirmed')
const notes = ref('')

// Restablece el formulario con los valores prellenados (clic en un hueco de la agenda, etc.).
watch(open, (v) => {
  if (!v) return
  const pre = ui.newAppointment
  clientMode.value = 'existing'
  clientSearch.value = ''
  clientId.value = pre.clientId ?? null
  Object.assign(newClient, { name: '', phone: '', email: '' })
  serviceIds.value = []
  staffId.value = pre.staffId ?? ''
  date.value = pre.date ?? toISODate(now.value)
  start.value = pre.start ?? null
  status.value = 'confirmed'
  notes.value = ''
})

const clientMatches = computed(() => {
  const q = clientSearch.value.trim().toLowerCase()
  if (!q) return clients.items.slice(0, 5)
  return clients.items.filter(c => c.name.toLowerCase().includes(q) || c.phone.includes(q.replace(/\D/g, '') || '#')).slice(0, 5)
})
const selectedClient = computed(() => (clientId.value ? clients.get(clientId.value) : undefined))

const totals = computed(() => services.totals(serviceIds.value))
const capable = computed(() => staffStore.capableOf(serviceIds.value))
const staffOptions = computed(() => capable.value.map(m => ({ value: m.id, label: m.name })))

watch(capable, (list) => {
  if (staffId.value && !list.some(m => m.id === staffId.value)) staffId.value = ''
})

const slots = computed(() =>
  staffId.value && date.value && serviceIds.value.length
    ? slotsFor({ date: date.value, serviceIds: serviceIds.value, staffId: staffId.value, ignoreAdvance: true })
    : [],
)
const slotOptions = computed(() => slots.value.map(s => ({ value: s.start, label: formatTime(s.start) })))

// Si el horario prellenado no está disponible con la nueva combinación, se limpia.
watch(slots, (list) => {
  if (start.value !== null && !list.some(s => s.start === start.value)) start.value = null
})

/** Proxy para el select (no acepta `null`). */
const startModel = computed({
  get: () => start.value ?? undefined,
  set: (v: number | undefined) => (start.value = v ?? null),
})

const statusOptions = [
  { value: 'confirmed' as const, label: 'Confirmada' },
  { value: 'pending' as const, label: 'Pendiente' },
]

const clientValid = computed(() =>
  clientMode.value === 'existing'
    ? !!clientId.value
    : newClient.name.trim().length >= 3 && normalizePhone(newClient.phone).length === 10,
)
const valid = computed(() => clientValid.value && serviceIds.value.length > 0 && !!staffId.value && !!date.value && start.value !== null)

function toggleService(id: string) {
  serviceIds.value = serviceIds.value.includes(id) ? serviceIds.value.filter(s => s !== id) : [...serviceIds.value, id]
}

function save() {
  if (!valid.value) return
  const client = clientMode.value === 'existing' ? selectedClient.value! : clients.upsert(newClient)
  try {
    const apt = appointments.create({
      clientId: client.id,
      staffId: staffId.value,
      serviceIds: serviceIds.value,
      date: date.value,
      start: start.value!,
      duration: totals.value.duration,
      price: totals.value.price,
      notes: notes.value.trim() || undefined,
      source: 'admin',
      status: status.value,
    })
    open.value = false
    toast.success('Cita creada', {
      description: `${client.name} · ${formatDateShort(apt.date)}, ${formatTime(apt.start)}`,
      action: { label: 'Ver', onClick: () => router.push({ path: '/admin/agenda', query: { date: apt.date, cita: apt.id } }) },
    })
  }
  catch (e) {
    if (e instanceof ConflictError) toast.error('Ese horario se acaba de ocupar')
    else throw e
  }
}
</script>

<template>
  <UiDialog v-model:open="open" title="Nueva cita" description="Agenda una cita desde el panel. Solo se muestran horarios libres." size="lg">
    <form id="new-apt" class="space-y-6" @submit.prevent="save">
      <!-- Cliente -->
      <fieldset class="space-y-2.5">
        <div class="flex items-center justify-between">
          <legend class="text-[13px] font-medium">
            Cliente
          </legend>
          <button type="button" class="text-xs text-muted underline-offset-4 hover:text-foreground hover:underline" @click="clientMode = clientMode === 'existing' ? 'new' : 'existing'">
            {{ clientMode === 'existing' ? '+ Nuevo cliente' : 'Elegir existente' }}
          </button>
        </div>

        <template v-if="clientMode === 'existing'">
          <div v-if="selectedClient" class="flex items-center gap-3 rounded-[10px] border border-border bg-surface-2/50 px-3 py-2">
            <SharedAvatar :name="selectedClient.name" class="size-8 text-[10px]" />
            <div class="min-w-0 flex-1">
              <p class="text-[13px] font-medium">
                {{ selectedClient.name }}
              </p>
              <p class="text-xs text-muted tabular-nums">
                {{ formatPhone(selectedClient.phone) }}
              </p>
            </div>
            <UiButton variant="ghost" size="xs" @click="clientId = null">
              Cambiar
            </UiButton>
          </div>
          <template v-else>
            <UiInput v-model="clientSearch" icon="lucide:search" placeholder="Buscar por nombre o teléfono" aria-label="Buscar cliente" />
            <ul class="max-h-48 overflow-y-auto rounded-[10px] border border-border">
              <li v-for="c in clientMatches" :key="c.id" class="border-b border-border last:border-0">
                <button type="button" class="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-surface-2" @click="clientId = c.id">
                  <SharedAvatar :name="c.name" class="size-7 text-[9px]" />
                  <span class="flex-1 text-[13px]">{{ c.name }}</span>
                  <span class="text-xs text-muted tabular-nums">{{ formatPhone(c.phone) }}</span>
                </button>
              </li>
              <li v-if="!clientMatches.length" class="px-3 py-4 text-center text-xs text-muted">
                Sin coincidencias.
                <button type="button" class="underline" @click="clientMode = 'new'; newClient.name = clientSearch">
                  Crear “{{ clientSearch }}”
                </button>
              </li>
            </ul>
          </template>
        </template>
        <div v-else class="grid gap-2.5 sm:grid-cols-3">
          <UiInput v-model="newClient.name" placeholder="Nombre completo" aria-label="Nombre" />
          <UiInput v-model="newClient.phone" type="tel" inputmode="numeric" placeholder="Teléfono (10 dígitos)" aria-label="Teléfono" />
          <UiInput v-model="newClient.email" type="email" placeholder="Correo (opcional)" aria-label="Correo" />
        </div>
      </fieldset>

      <!-- Servicios -->
      <fieldset class="space-y-2.5">
        <legend class="mb-2.5 flex w-full items-center justify-between text-[13px] font-medium">
          Servicios
          <span v-if="serviceIds.length" class="text-xs font-normal text-muted tabular-nums">{{ formatDuration(totals.duration) }} · {{ formatPrice(totals.price) }}</span>
        </legend>
        <div class="flex flex-wrap gap-1.5">
          <button
            v-for="s in services.active"
            :key="s.id"
            type="button"
            :aria-pressed="serviceIds.includes(s.id)"
            :class="cn(
              'inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-xs font-medium transition-colors',
              serviceIds.includes(s.id) ? 'border-foreground bg-foreground text-background' : 'border-border text-muted hover:border-border-strong hover:text-foreground',
            )"
            @click="toggleService(s.id)"
          >
            <Icon v-if="serviceIds.includes(s.id)" name="lucide:check" class="size-3" />
            {{ s.name }}
          </button>
        </div>
      </fieldset>

      <!-- Cuándo -->
      <div class="grid gap-4 sm:grid-cols-3">
        <div class="space-y-1.5">
          <UiLabel for="na-staff">
            {{ capitalize(terms.professional) }}
          </UiLabel>
          <UiSelect id="na-staff" v-model="staffId" :options="staffOptions" :placeholder="serviceIds.length ? (staffOptions.length ? 'Elegir' : 'Nadie disponible') : 'Elige servicios'" :disabled="!serviceIds.length || !staffOptions.length" />
        </div>
        <div class="space-y-1.5">
          <UiLabel for="na-date">
            Fecha
          </UiLabel>
          <UiInput id="na-date" v-model="date" type="date" :min="toISODate(now)" />
        </div>
        <div class="space-y-1.5">
          <UiLabel for="na-time" :hint="staffId && serviceIds.length ? `${slots.length} libres` : undefined">
            Hora
          </UiLabel>
          <UiSelect id="na-time" v-model="startModel" :options="slotOptions" :placeholder="slots.length ? 'Elegir' : 'Sin horarios'" :disabled="!slots.length" />
        </div>
      </div>

      <div class="grid gap-4 sm:grid-cols-[1fr_2fr]">
        <div class="space-y-1.5">
          <UiLabel for="na-status">
            Estado
          </UiLabel>
          <UiSelect id="na-status" v-model="status" :options="statusOptions" />
        </div>
        <div class="space-y-1.5">
          <UiLabel for="na-notes">
            Notas
          </UiLabel>
          <UiInput id="na-notes" v-model="notes" placeholder="Opcional" />
        </div>
      </div>
    </form>

    <template #footer>
      <UiButton variant="outline" @click="open = false">
        Cancelar
      </UiButton>
      <UiButton type="submit" form="new-apt" :disabled="!valid">
        Crear cita
      </UiButton>
    </template>
  </UiDialog>
</template>
