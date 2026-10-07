<script setup lang="ts">
import { toast } from 'vue-sonner'

const route = useRoute()
const clients = useClientsStore()
const appointments = useAppointmentsStore()
const services = useServicesStore()
const staff = useStaffStore()
const ui = useUiStore()
const { statsOf } = useClientStats()

const client = computed(() => clients.get(String(route.params.id)))

definePageMeta({ layout: 'admin', middleware: 'admin' })
// El breadcrumb muestra el nombre del cliente.
watchEffect(() => {
  route.meta.title = client.value?.name ?? 'Cliente'
})
useSeoMeta({ title: () => client.value?.name ?? 'Cliente', robots: 'noindex' })

const history = computed(() => (client.value ? appointments.forClient(client.value.id).slice().reverse() : []))
const stats = computed(() => (client.value ? statsOf(client.value) : null))
const favorite = computed(() => {
  const tally = new Map<string, number>()
  for (const a of history.value) for (const id of a.serviceIds) tally.set(id, (tally.get(id) ?? 0) + 1)
  const top = [...tally.entries()].sort((a, b) => b[1] - a[1])[0]
  return top ? services.get(top[0])?.name : undefined
})

const notes = ref('')
watch(client, c => (notes.value = c?.notes ?? ''), { immediate: true })
const dirty = computed(() => !!client.value && notes.value !== client.value.notes)

function saveNotes() {
  if (!client.value) return
  clients.update(client.value.id, { notes: notes.value.trim() })
  toast.success('Notas guardadas')
}

const selected = ref<string | null>(null)
</script>

<template>
  <div class="mx-auto max-w-6xl space-y-6 p-4 sm:p-6 lg:p-8">
    <UiButton to="/admin/clientes" variant="ghost" size="sm" class="-ml-2">
      <Icon name="lucide:arrow-left" class="size-4" />
      Clientes
    </UiButton>

    <SharedEmptyState v-if="!client" icon="lucide:user-x" title="Cliente no encontrado" class="surface-card" />

    <template v-else>
      <header class="flex flex-wrap items-center gap-4">
        <SharedAvatar :name="client.name" class="size-14 text-base" />
        <div class="min-w-0 flex-1">
          <h1 class="text-2xl font-semibold tracking-tight">
            {{ client.name }}
          </h1>
          <p class="mt-0.5 flex flex-wrap gap-x-3 text-[13px] text-muted">
            <a :href="`tel:+52${client.phone}`" class="tabular-nums hover:text-foreground">{{ formatPhone(client.phone) }}</a>
            <a :href="`mailto:${client.email}`" class="hover:text-foreground">{{ client.email }}</a>
          </p>
        </div>
        <div class="flex gap-2">
          <UiButton :href="whatsappUrl(client.phone, `Hola ${client.name.split(' ')[0]}`)" target="_blank" variant="outline" size="sm">
            <Icon name="lucide:message-circle" class="size-4" />
            WhatsApp
          </UiButton>
          <UiButton size="sm" @click="ui.openNewAppointment({ clientId: client.id })">
            <Icon name="lucide:plus" class="size-4" />
            Agendar
          </UiButton>
        </div>
      </header>

      <dl v-if="stats" class="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div class="surface-card p-4">
          <dt class="text-xs text-muted">
            Visitas totales
          </dt>
          <dd class="mt-1 text-2xl font-semibold tabular-nums">
            {{ stats.totalVisits }}
          </dd>
        </div>
        <div class="surface-card p-4">
          <dt class="text-xs text-muted">
            Total gastado
          </dt>
          <dd class="mt-1 text-2xl font-semibold tabular-nums">
            {{ formatPrice(stats.spent) }}
          </dd>
        </div>
        <div class="surface-card p-4">
          <dt class="text-xs text-muted">
            Última visita
          </dt>
          <dd class="mt-1 text-[15px] font-medium">
            {{ stats.last ? formatDateShort(stats.last) : 'Sin registro' }}
          </dd>
        </div>
        <div class="surface-card p-4">
          <dt class="text-xs text-muted">
            Servicio favorito
          </dt>
          <dd class="mt-1 truncate text-[15px] font-medium">
            {{ favorite ?? '—' }}
          </dd>
        </div>
      </dl>

      <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <section class="surface-card overflow-hidden" aria-labelledby="hist-title">
          <h2 id="hist-title" class="border-b border-border px-5 py-3.5 text-[15px] font-semibold tracking-tight">
            Historial de citas
          </h2>
          <ol v-if="history.length" class="divide-y divide-border">
            <li v-for="a in history" :key="a.id">
              <button type="button" class="flex w-full items-center gap-4 px-5 py-3 text-left transition-colors hover:bg-surface-2/50" @click="selected = a.id">
                <div class="w-24 shrink-0">
                  <p class="text-[13px] font-medium tabular-nums">
                    {{ formatDateShort(a.date) }}
                  </p>
                  <p class="text-xs text-muted tabular-nums">
                    {{ formatTime(a.start) }}
                  </p>
                </div>
                <div class="min-w-0 flex-1">
                  <p class="truncate text-[13px]">
                    {{ services.resolve(a.serviceIds).map(s => s.name).join(' + ') }}
                  </p>
                  <p class="truncate text-xs text-muted">
                    con {{ staff.get(a.staffId)?.name }}
                  </p>
                </div>
                <SharedStatusBadge :status="a.status" class="hidden sm:inline-flex" />
                <span class="w-16 text-right text-[13px] font-medium tabular-nums">{{ formatPrice(a.price) }}</span>
              </button>
            </li>
          </ol>
          <SharedEmptyState v-else icon="lucide:calendar" title="Sin citas registradas" description="Las visitas previas al sistema se cuentan en el total." />
        </section>

        <section class="surface-card h-fit p-5" aria-labelledby="notes-title">
          <h2 id="notes-title" class="text-[15px] font-semibold tracking-tight">
            Notas
          </h2>
          <p class="mt-0.5 text-xs text-muted">
            Preferencias, alergias, detalles para la próxima visita.
          </p>
          <UiTextarea v-model="notes" rows="6" class="mt-3" aria-labelledby="notes-title" placeholder="Escribe una nota…" @keydown.ctrl.enter="saveNotes" @keydown.meta.enter="saveNotes" />
          <div class="mt-3 flex items-center justify-between gap-2">
            <span class="text-[11px] text-muted">Ctrl + Enter para guardar</span>
            <UiButton size="sm" :disabled="!dirty" @click="saveNotes">
              Guardar
            </UiButton>
          </div>
          <p class="mt-4 border-t border-border pt-4 text-xs text-muted">
            Cliente desde {{ formatDateFns(toISODate(new Date(client.createdAt)), "MMMM 'de' yyyy") }}
          </p>
        </section>
      </div>

      <AdminAppointmentSheet :appointment-id="selected" @close="selected = null" />
    </template>
  </div>
</template>
