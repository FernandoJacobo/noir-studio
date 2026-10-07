<script setup lang="ts">
import { toast } from 'vue-sonner'
import type { Appointment, AppointmentStatus } from '~~/types'

definePageMeta({ layout: 'admin', middleware: 'admin' })
useSeoMeta({ title: 'Citas', robots: 'noindex' })

const appointments = useAppointmentsStore()
const clients = useClientsStore()
const services = useServicesStore()
const staff = useStaffStore()
const ui = useUiStore()
const now = useNowTicker()
const { terms } = useAppConfig()

type SortKey = 'date' | 'client' | 'price' | 'status'
type Range = 'upcoming' | 'today' | 'week' | 'past' | 'all' | 'custom'

const search = ref('')
const debouncedSearch = refDebounced(search, 150)
const status = ref<AppointmentStatus | 'all'>('all')
const staffId = ref('all')
const range = ref<Range>('upcoming')
const from = ref('')
const to = ref('')
const sortKey = ref<SortKey>('date')
const sortDir = ref<1 | -1>(1)
const page = ref(1)
const PAGE_SIZE = 12
const selected = ref<string | null>(null)

const today = computed(() => toISODate(now.value))

const statusOptions = [
  { value: 'all' as const, label: 'Todos los estados' },
  ...(Object.keys(STATUS_META) as AppointmentStatus[]).map(s => ({ value: s, label: STATUS_META[s].label })),
]
const staffOptions = computed(() => [{ value: 'all', label: `Todos los ${terms.professionals}` }, ...staff.items.map(m => ({ value: m.id, label: m.name }))])
const rangeOptions: { value: Range, label: string }[] = [
  { value: 'upcoming', label: 'Próximas' },
  { value: 'today', label: 'Hoy' },
  { value: 'week', label: 'Esta semana' },
  { value: 'past', label: 'Pasadas' },
  { value: 'all', label: 'Todas' },
  { value: 'custom', label: 'Rango…' },
]

function inRange(a: Appointment) {
  const t = today.value
  switch (range.value) {
    case 'upcoming': return a.date >= t
    case 'today': return a.date === t
    case 'week': return a.date >= startOfWeekISO(t) && a.date <= addDaysISO(startOfWeekISO(t), 6)
    case 'past': return a.date < t
    case 'custom': return (!from.value || a.date >= from.value) && (!to.value || a.date <= to.value)
    default: return true
  }
}

const normalize = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

const filtered = computed(() => {
  const q = normalize(debouncedSearch.value.trim())
  return appointments.items.filter((a) => {
    if (status.value !== 'all' && a.status !== status.value) return false
    if (staffId.value !== 'all' && a.staffId !== staffId.value) return false
    if (!inRange(a)) return false
    if (!q) return true
    const client = clients.get(a.clientId)
    return normalize(`${a.folio} ${client?.name ?? ''} ${client?.phone ?? ''}`).includes(q)
  })
})

const sorted = computed(() => {
  const dir = sortDir.value
  const key = sortKey.value
  return [...filtered.value].sort((a, b) => {
    let r = 0
    if (key === 'date') r = a.date.localeCompare(b.date) || a.start - b.start
    else if (key === 'client') r = (clients.get(a.clientId)?.name ?? '').localeCompare(clients.get(b.clientId)?.name ?? '', 'es')
    else if (key === 'price') r = a.price - b.price
    else r = STATUS_META[a.status].label.localeCompare(STATUS_META[b.status].label, 'es')
    return r * dir
  })
})

const pageCount = computed(() => Math.max(1, Math.ceil(sorted.value.length / PAGE_SIZE)))
const rows = computed(() => sorted.value.slice((page.value - 1) * PAGE_SIZE, page.value * PAGE_SIZE))
watch([debouncedSearch, status, staffId, range, from, to], () => (page.value = 1))
watch(range, r => (sortDir.value = r === 'past' ? -1 : 1))

function toggleSort(key: SortKey) {
  if (sortKey.value === key) sortDir.value = sortDir.value === 1 ? -1 : 1
  else {
    sortKey.value = key
    sortDir.value = 1
  }
}

const totalShown = computed(() => filtered.value.filter(a => a.status !== 'cancelled' && a.status !== 'no_show').reduce((s, a) => s + a.price, 0))

function setStatus(a: Appointment, s: AppointmentStatus) {
  appointments.setStatus(a.id, s)
  toast.success(`${clients.get(a.clientId)?.name ?? 'Cita'}: ${STATUS_META[s].label.toLowerCase()}`, {
    action: { label: 'Deshacer', onClick: () => appointments.setStatus(a.id, a.status) },
  })
}

function clearFilters() {
  search.value = ''
  status.value = 'all'
  staffId.value = 'all'
  range.value = 'all'
}

const columns: { key: SortKey, label: string, class?: string }[] = [
  { key: 'date', label: 'Fecha y hora' },
  { key: 'client', label: 'Cliente' },
  { key: 'status', label: 'Estado' },
  { key: 'price', label: 'Total', class: 'text-right justify-end' },
]
</script>

<template>
  <div class="mx-auto max-w-7xl space-y-4 p-4 sm:p-6 lg:p-8">
    <header class="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 class="text-2xl font-semibold tracking-tight">
          Citas
        </h1>
        <p class="mt-1 text-[13px] text-muted tabular-nums">
          {{ pluralize(filtered.length, 'cita') }} · {{ formatPrice(totalShown) }}
        </p>
      </div>
      <UiButton size="sm" @click="ui.openNewAppointment()">
        <Icon name="lucide:plus" class="size-4" />
        Nueva cita
      </UiButton>
    </header>

    <!-- Filtros en una fila -->
    <div class="flex flex-wrap items-center gap-2">
      <UiInput v-model="search" icon="lucide:search" placeholder="Folio, cliente o teléfono" aria-label="Buscar citas" class="w-full sm:w-64 [&_input]:h-9" />
      <UiSelect v-model="range" :options="rangeOptions" label="Rango de fechas" class="h-9 w-[calc(50%-4px)] sm:w-36" />
      <template v-if="range === 'custom'">
        <UiInput v-model="from" type="date" aria-label="Desde" class="h-9 w-[calc(50%-4px)] sm:w-40" />
        <UiInput v-model="to" type="date" aria-label="Hasta" class="h-9 w-[calc(50%-4px)] sm:w-40" />
      </template>
      <UiSelect v-model="status" :options="statusOptions" label="Estado" class="h-9 w-[calc(50%-4px)] sm:w-44" />
      <UiSelect v-model="staffId" :options="staffOptions" label="Profesional" class="h-9 w-[calc(50%-4px)] sm:w-48" />
    </div>

    <div class="surface-card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full min-w-[760px] text-[13px]">
          <thead class="border-b border-border bg-surface-2/40 text-left text-xs text-muted">
            <tr>
              <th v-for="col in columns" :key="col.key" scope="col" class="px-4 py-2.5 font-medium" :aria-sort="sortKey === col.key ? (sortDir === 1 ? 'ascending' : 'descending') : 'none'">
                <button type="button" :class="cn('inline-flex w-full items-center gap-1 hover:text-foreground', col.class)" @click="toggleSort(col.key)">
                  {{ col.label }}
                  <Icon :name="sortKey === col.key ? (sortDir === 1 ? 'lucide:arrow-up' : 'lucide:arrow-down') : 'lucide:chevrons-up-down'" :class="cn('size-3', sortKey !== col.key && 'opacity-40')" />
                </button>
              </th>
              <th scope="col" class="px-4 py-2.5 font-medium">
                Servicio
              </th>
              <th scope="col" class="px-4 py-2.5 font-medium">
                {{ capitalize(terms.professional) }}
              </th>
              <th scope="col" class="w-12 px-2 py-2.5">
                <span class="sr-only">Acciones</span>
              </th>
            </tr>
          </thead>
          <TransitionGroup tag="tbody" name="list" class="divide-y divide-border">
            <tr v-for="a in rows" :key="a.id" class="group cursor-pointer transition-colors hover:bg-surface-2/50" @click="selected = a.id">
              <td class="whitespace-nowrap px-4 py-3">
                <p class="font-medium tabular-nums">
                  {{ formatDateShort(a.date) }}
                </p>
                <p class="text-xs text-muted tabular-nums">
                  {{ formatTimeRange(a.start, a.duration) }}
                </p>
              </td>
              <td class="px-4 py-3">
                <p class="font-medium">
                  {{ clients.get(a.clientId)?.name }}
                </p>
                <p class="font-mono text-[11px] text-muted">
                  {{ a.folio }}
                </p>
              </td>
              <td class="px-4 py-3">
                <SharedStatusBadge :status="a.status" />
              </td>
              <td class="px-4 py-3 text-right font-medium tabular-nums">
                {{ formatPrice(a.price) }}
              </td>
              <td class="max-w-[220px] truncate px-4 py-3 text-muted">
                {{ services.resolve(a.serviceIds).map(s => s.name).join(' + ') }}
              </td>
              <td class="px-4 py-3">
                <span class="flex items-center gap-2">
                  <SharedAvatar :name="staff.get(a.staffId)?.name ?? '?'" :src="staff.get(a.staffId)?.photo" class="size-6 text-[9px]" />
                  <span class="truncate">{{ staff.get(a.staffId)?.name.split(' ')[0] }}</span>
                </span>
              </td>
              <td class="px-2 py-3" @click.stop>
                <UiDropdown>
                  <template #trigger>
                    <UiButton variant="ghost" size="icon-sm" :aria-label="`Acciones para ${a.folio}`">
                      <Icon name="lucide:ellipsis" class="size-4" />
                    </UiButton>
                  </template>
                  <UiDropdownItem icon="lucide:circle-check" :disabled="a.status === 'confirmed'" @select="setStatus(a, 'confirmed')">
                    Confirmar
                  </UiDropdownItem>
                  <UiDropdownItem icon="lucide:check-check" :disabled="a.status === 'completed'" @select="setStatus(a, 'completed')">
                    Completar
                  </UiDropdownItem>
                  <UiDropdownItem icon="lucide:user-x" :disabled="a.status === 'no_show'" @select="setStatus(a, 'no_show')">
                    No asistió
                  </UiDropdownItem>
                  <UiDropdownSeparator />
                  <UiDropdownItem icon="lucide:eye" @select="selected = a.id">
                    Ver detalle
                  </UiDropdownItem>
                  <UiDropdownItem icon="lucide:x" danger :disabled="a.status === 'cancelled'" @select="setStatus(a, 'cancelled')">
                    Cancelar
                  </UiDropdownItem>
                </UiDropdown>
              </td>
            </tr>
          </TransitionGroup>
        </table>
      </div>

      <SharedEmptyState v-if="!rows.length" icon="lucide:search-x" title="Sin citas que coincidan" description="Ajusta la búsqueda o los filtros.">
        <UiButton variant="outline" size="sm" @click="clearFilters">
          Limpiar filtros
        </UiButton>
      </SharedEmptyState>

      <footer v-if="sorted.length > PAGE_SIZE" class="flex items-center justify-between gap-3 border-t border-border px-4 py-2.5 text-xs text-muted">
        <span class="tabular-nums">{{ (page - 1) * PAGE_SIZE + 1 }}–{{ Math.min(page * PAGE_SIZE, sorted.length) }} de {{ sorted.length }}</span>
        <nav class="flex items-center gap-1" aria-label="Paginación">
          <UiButton variant="ghost" size="icon-sm" :disabled="page === 1" aria-label="Página anterior" @click="page--">
            <Icon name="lucide:chevron-left" class="size-4" />
          </UiButton>
          <span class="px-2 tabular-nums">{{ page }} / {{ pageCount }}</span>
          <UiButton variant="ghost" size="icon-sm" :disabled="page === pageCount" aria-label="Página siguiente" @click="page++">
            <Icon name="lucide:chevron-right" class="size-4" />
          </UiButton>
        </nav>
      </footer>
    </div>

    <AdminAppointmentSheet :appointment-id="selected" @close="selected = null" />
  </div>
</template>
