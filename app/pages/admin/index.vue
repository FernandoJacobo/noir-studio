<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })
useSeoMeta({ title: 'Dashboard', robots: 'noindex' })

const stats = useDashboardStats()
const staff = useStaffStore()
const clients = useClientsStore()
const services = useServicesStore()
const ui = useUiStore()
const now = useNowTicker()

const metric = ref<'count' | 'revenue'>('count')
const selected = ref<string | null>(null)

// Skeleton breve en la primera carga: el dashboard "consulta" datos.
const ready = ref(false)
onMounted(() => setTimeout(() => (ready.value = true), 350))

const greeting = computed(() => {
  const h = now.value.getHours()
  return h < 12 ? 'Buenos días' : h < 19 ? 'Buenas tardes' : 'Buenas noches'
})

const totals30 = computed(() => ({
  count: stats.series.value.reduce((s, d) => s + d.count, 0),
  revenue: stats.series.value.reduce((s, d) => s + d.revenue, 0),
}))

const nowMin = computed(() => minutesOfDay(now.value))
/** Índice de la primera cita que aún no termina (para dibujar el marcador "ahora"). */
const nextIndex = computed(() => stats.todayAppointments.value.findIndex(a => a.start + a.duration > nowMin.value))

const tableRows = computed(() => stats.series.value.slice().reverse())
const showTable = ref(false)
</script>

<template>
  <div class="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
    <header class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p class="text-[13px] text-muted first-letter:uppercase">
          {{ formatDateLong(stats.today.value, true) }}
        </p>
        <h1 class="mt-1 text-2xl font-semibold tracking-tight sm:text-[28px]">
          {{ greeting }}, <span class="text-display font-normal">equipo</span>
        </h1>
      </div>
      <div class="flex gap-2">
        <UiButton to="/admin/agenda" variant="outline" size="sm">
          <Icon name="lucide:calendar-days" class="size-4" />
          Ver agenda
        </UiButton>
      </div>
    </header>

    <!-- KPIs -->
    <section aria-label="Indicadores" class="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
      <template v-if="ready">
        <AdminKpiCard
          label="Citas de hoy"
          icon="lucide:calendar-days"
          :value="String(stats.todayCount.value)"
          :delta="percentChange(stats.todayCount.value, stats.lastWeekSameDay.value)"
          caption="vs. mismo día semana pasada"
        />
        <AdminKpiCard
          label="Ingresos de la semana"
          icon="lucide:wallet"
          :value="formatPrice(stats.weekRevenue.value)"
          :delta="percentChange(stats.weekRevenue.value, stats.prevWeekRevenue.value)"
          caption="vs. semana anterior"
        />
        <AdminKpiCard
          label="Ocupación"
          icon="lucide:gauge"
          :value="`${stats.weekOccupancy.value}%`"
          :delta="stats.weekOccupancy.value - stats.prevWeekOccupancy.value"
          unit="pts"
          caption="de la capacidad semanal"
        />
        <AdminKpiCard
          label="Clientes nuevos"
          icon="lucide:user-plus"
          :value="String(stats.newClients.value)"
          :delta="percentChange(stats.newClients.value, stats.prevNewClients.value)"
          caption="últimos 7 días"
        />
      </template>
      <template v-else>
        <div v-for="n in 4" :key="n" class="surface-card p-5">
          <UiSkeleton class="h-3.5 w-24" />
          <UiSkeleton class="mt-4 h-7 w-20" />
          <UiSkeleton class="mt-4 h-3 w-32" />
        </div>
      </template>
    </section>

    <div class="grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
      <!-- Tendencia -->
      <section class="surface-card p-4 sm:p-5" aria-labelledby="trend-title">
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 id="trend-title" class="text-[15px] font-semibold tracking-tight">
              Últimos 30 días
            </h2>
            <p class="mt-0.5 text-[13px] text-muted tabular-nums">
              {{ pluralize(totals30.count, 'cita') }} · {{ formatPrice(totals30.revenue) }} en ingresos
            </p>
          </div>
          <div class="flex items-center gap-2">
            <UiTabs v-model="metric" size="sm" label="Métrica" :items="[{ value: 'count', label: 'Citas' }, { value: 'revenue', label: 'Ingresos' }]" />
            <UiTooltip :content="showTable ? 'Ver gráfica' : 'Ver como tabla'">
              <UiButton variant="ghost" size="icon-sm" :aria-label="showTable ? 'Ver gráfica' : 'Ver como tabla'" @click="showTable = !showTable">
                <Icon :name="showTable ? 'lucide:chart-column' : 'lucide:table'" class="size-4" />
              </UiButton>
            </UiTooltip>
          </div>
        </div>
        <div class="mt-4 h-[280px]">
          <div v-if="showTable" class="h-full overflow-y-auto rounded-[10px] border border-border">
            <table class="w-full text-[13px]">
              <thead class="sticky top-0 bg-surface text-left text-xs text-muted">
                <tr><th class="px-3 py-2 font-medium">Fecha</th><th class="px-3 py-2 text-right font-medium">Citas</th><th class="px-3 py-2 text-right font-medium">Ingresos</th></tr>
              </thead>
              <tbody class="divide-y divide-border tabular-nums">
                <tr v-for="d in tableRows" :key="d.date">
                  <td class="px-3 py-1.5">
                    {{ formatDateShort(d.date) }}
                  </td>
                  <td class="px-3 py-1.5 text-right">
                    {{ d.count }}
                  </td>
                  <td class="px-3 py-1.5 text-right">
                    {{ formatPrice(d.revenue) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <AdminTrendChart v-else-if="ready" :data="stats.series.value" :metric="metric" />
          <UiSkeleton v-else class="h-full w-full rounded-[10px]" />
        </div>
      </section>

      <!-- Hoy -->
      <section class="surface-card flex flex-col p-4 sm:p-5" aria-labelledby="today-title">
        <div class="flex items-center justify-between">
          <h2 id="today-title" class="text-[15px] font-semibold tracking-tight">
            Próximas citas de hoy
          </h2>
          <UiBadge>{{ stats.todayAppointments.value.length }}</UiBadge>
        </div>
        <ol v-if="stats.todayAppointments.value.length" class="relative mt-4 max-h-[300px] flex-1 space-y-1 overflow-y-auto pr-1">
          <template v-for="(a, i) in stats.todayAppointments.value" :key="a.id">
            <li v-if="i === nextIndex" class="flex items-center gap-2 py-1 text-[11px] font-medium text-now" aria-label="Ahora">
              <span class="size-2 rounded-full bg-now" />
              <span class="h-px flex-1 bg-now/60" />
              {{ formatTime(nowMin) }}
            </li>
            <li>
              <button
                type="button"
                :class="cn('group flex w-full items-center gap-3 rounded-[10px] px-2 py-2 text-left transition-colors hover:bg-surface-2', a.start + a.duration <= nowMin && 'opacity-55')"
                @click="selected = a.id"
              >
                <span class="w-[68px] shrink-0 text-xs font-medium tabular-nums">{{ formatTime(a.start) }}</span>
                <span class="h-8 w-[3px] shrink-0 rounded-full" :class="STATUS_STYLES[a.status].bar" />
                <span class="min-w-0 flex-1">
                  <span class="block truncate text-[13px] font-medium">{{ clients.get(a.clientId)?.name }}</span>
                  <span class="block truncate text-xs text-muted">{{ services.resolve(a.serviceIds).map(s => s.name).join(' + ') }}</span>
                </span>
                <SharedAvatar :name="staff.get(a.staffId)?.name ?? '?'" :src="staff.get(a.staffId)?.photo" class="size-6 text-[9px]" />
              </button>
            </li>
          </template>
        </ol>
        <SharedEmptyState v-else icon="lucide:coffee" title="Día libre" description="No hay citas agendadas para hoy." class="flex-1 py-8">
          <UiButton size="sm" variant="outline" @click="ui.openNewAppointment()">
            Agendar una cita
          </UiButton>
        </SharedEmptyState>
      </section>
    </div>

    <div class="grid gap-4 lg:grid-cols-2">
      <!-- Servicios más reservados -->
      <section class="surface-card p-4 sm:p-5" aria-labelledby="top-title">
        <h2 id="top-title" class="text-[15px] font-semibold tracking-tight">
          Servicios más reservados
        </h2>
        <p class="mt-0.5 text-[13px] text-muted">
          Últimos 30 días
        </p>
        <ul class="mt-5 space-y-3.5">
          <li v-for="(t, i) in stats.topServices.value" :key="t.service!.id" class="text-[13px]">
            <div class="mb-1.5 flex items-baseline justify-between gap-3">
              <span class="flex items-center gap-2">
                <span class="w-4 text-xs text-muted tabular-nums">{{ i + 1 }}</span>
                {{ t.service!.name }}
              </span>
              <span class="tabular-nums text-muted">{{ pluralize(t.count, 'reserva') }}</span>
            </div>
            <div class="ml-6 h-1.5 overflow-hidden rounded-full bg-surface-2">
              <div class="h-full rounded-full transition-[width] duration-700 ease-[var(--ease-out-soft)]" :class="i === 0 ? 'bg-accent' : 'bg-foreground/70'" :style="{ width: ready ? `${t.share * 100}%` : '0%' }" />
            </div>
          </li>
        </ul>
      </section>

      <!-- Equipo hoy -->
      <section class="surface-card p-4 sm:p-5" aria-labelledby="staff-title">
        <h2 id="staff-title" class="text-[15px] font-semibold tracking-tight">
          Carga del equipo hoy
        </h2>
        <p class="mt-0.5 text-[13px] text-muted">
          Minutos agendados vs. disponibles
        </p>
        <ul class="mt-5 space-y-3">
          <li v-for="m in staff.active" :key="m.id" class="flex items-center gap-3">
            <SharedAvatar :name="m.name" :src="m.photo" class="size-8" />
            <div class="min-w-0 flex-1">
              <div class="mb-1.5 flex items-baseline justify-between text-[13px]">
                <span class="truncate font-medium">{{ m.name }}</span>
                <span class="text-xs text-muted tabular-nums">
                  {{ stats.todayAppointments.value.filter(a => a.staffId === m.id).length }} citas
                </span>
              </div>
              <AdminStaffLoad :member="m" :date="stats.today.value" />
            </div>
          </li>
        </ul>
      </section>
    </div>

    <AdminAppointmentSheet :appointment-id="selected" @close="selected = null" />
  </div>
</template>
