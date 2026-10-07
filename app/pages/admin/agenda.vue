<script setup lang="ts">
import { breakpointsTailwind } from '@vueuse/core'
import type { AgendaColumn, ISODate } from '~~/types'

definePageMeta({ layout: 'admin', middleware: 'admin' })
useSeoMeta({ title: 'Agenda', robots: 'noindex' })

type View = 'day' | 'week' | 'month' | 'list'

const route = useRoute()
const router = useRouter()
const appointmentsStore = useAppointmentsStore()
const staffStore = useStaffStore()
const settings = useSettingsStore()
const now = useNowTicker()
const { terms } = useAppConfig()

const isMobile = useBreakpoints(breakpointsTailwind).smaller('md')
const today = computed(() => toISODate(now.value))

const date = ref<ISODate>(typeof route.query.date === 'string' ? route.query.date : today.value)
const view = ref<View>('week')
const staffFilter = ref<string>('all')
const selected = ref<string | null>(typeof route.query.cita === 'string' ? route.query.cita : null)

// En móvil la vista por defecto es lista (la cuadrícula semanal no cabe).
watch(isMobile, m => (view.value = m ? 'list' : view.value === 'list' ? 'week' : view.value), { immediate: true })

// Navegación desde la paleta de comandos o toasts (?date=…&cita=…)
watch(() => route.query, (q) => {
  if (typeof q.date === 'string') date.value = q.date
  if (typeof q.cita === 'string') {
    selected.value = q.cita
    if (!isMobile.value) view.value = 'day'
  }
})

const viewItems = computed(() => isMobile.value
  ? [{ value: 'list' as View, label: 'Lista', icon: 'lucide:list' }, { value: 'day' as View, label: 'Día' }]
  : [{ value: 'day' as View, label: 'Día' }, { value: 'week' as View, label: 'Semana' }, { value: 'month' as View, label: 'Mes' }])

const staffOptions = computed(() => [
  { value: 'all', label: `Todo el ${terms.team.toLowerCase()}`, icon: 'lucide:users' },
  ...staffStore.active.map(m => ({ value: m.id, label: m.name })),
])

const weekStart = computed(() => startOfWeekISO(date.value))

const title = computed(() => {
  if (view.value === 'day') return capitalize(formatDateLong(date.value))
  if (view.value === 'month') return formatMonthYear(parseISODate(date.value))
  const end = addDaysISO(weekStart.value, 6)
  const sameMonth = weekStart.value.slice(0, 7) === end.slice(0, 7)
  return sameMonth
    ? `${Number(weekStart.value.slice(8))} – ${formatDateFns(end, "d 'de' MMMM yyyy")}`
    : `${formatDateFns(weekStart.value, 'd MMM')} – ${formatDateFns(end, 'd MMM yyyy')}`
})

function shift(dir: 1 | -1) {
  if (view.value === 'day') date.value = addDaysISO(date.value, dir)
  else if (view.value === 'month') {
    const d = parseISODate(date.value)
    date.value = toISODate(new Date(d.getFullYear(), d.getMonth() + dir, 1))
  }
  else date.value = addDaysISO(date.value, dir * 7)
}

const visible = computed(() =>
  appointmentsStore.sorted.filter(a => a.status !== 'cancelled' && (staffFilter.value === 'all' || a.staffId === staffFilter.value)),
)

const bounds = computed(() => weekBounds(settings.settings.hours))

const columns = computed<AgendaColumn[]>(() => {
  if (view.value === 'day') {
    const members = staffFilter.value === 'all' ? staffStore.active : staffStore.active.filter(m => m.id === staffFilter.value)
    return members.map(m => ({
      key: m.id,
      date: date.value,
      staffId: m.id,
      label: m.name,
      sublabel: getWorkingRanges(m, settings.settings.hours, date.value).length ? m.role : 'Descansa hoy',
      photo: m.photo,
      ranges: getWorkingRanges(m, settings.settings.hours, date.value),
    }))
  }
  return Array.from({ length: 7 }, (_, i) => {
    const d = addDaysISO(weekStart.value, i)
    const member = staffFilter.value !== 'all' ? staffStore.get(staffFilter.value) : undefined
    return {
      key: d,
      date: d,
      label: `${WEEKDAY_SHORT[weekdayOf(d)]} ${Number(d.slice(8))}`,
      sublabel: pluralize(visible.value.filter(a => a.date === d).length, 'cita'),
      isToday: d === today.value,
      ranges: member ? getWorkingRanges(member, settings.settings.hours, d) : (settings.settings.hours[weekdayOf(d)] ?? []),
    }
  })
})

// Desplaza la vista para que se vea la hora actual al entrar.
const scroller = useTemplateRef<HTMLElement>('scroller')
onMounted(() => nextTick(() => {
  const minutes = minutesOfDay(now.value) - bounds.value.start - 90
  scroller.value?.scrollTo({ top: Math.max(0, minutes * 1.4) })
}))

function closeSheet() {
  selected.value = null
  if (route.query.cita) router.replace({ query: { ...route.query, cita: undefined } })
}

function pickDay(d: ISODate) {
  date.value = d
  view.value = 'day'
}

onKeyStroke(['ArrowLeft', 'ArrowRight', 't', 'T'], (e) => {
  if (isTypingTarget(e.target) || document.querySelector('[role=dialog]') || e.metaKey || e.ctrlKey || e.altKey) return
  if (e.key.toLowerCase() === 't') date.value = today.value
  else shift(e.key === 'ArrowLeft' ? -1 : 1)
})
</script>

<template>
  <div class="flex h-[calc(100dvh-3.5rem)] flex-col p-3 sm:p-4 lg:p-6">
    <!-- Barra de herramientas -->
    <div class="mb-3 flex flex-wrap items-center gap-2 sm:mb-4">
      <div class="flex items-center gap-1">
        <UiButton variant="outline" size="sm" @click="date = today">
          Hoy
        </UiButton>
        <UiTooltip content="Anterior" shortcut="←">
          <UiButton variant="ghost" size="icon-sm" aria-label="Anterior" @click="shift(-1)">
            <Icon name="lucide:chevron-left" class="size-4" />
          </UiButton>
        </UiTooltip>
        <UiTooltip content="Siguiente" shortcut="→">
          <UiButton variant="ghost" size="icon-sm" aria-label="Siguiente" @click="shift(1)">
            <Icon name="lucide:chevron-right" class="size-4" />
          </UiButton>
        </UiTooltip>
      </div>
      <h1 class="mr-auto text-[15px] font-semibold tracking-tight sm:text-lg" aria-live="polite">
        {{ view === 'list' ? `Semana del ${formatDateFns(weekStart, "d 'de' MMMM")}` : title }}
      </h1>
      <UiSelect v-model="staffFilter" :options="staffOptions" label="Filtrar por profesional" class="h-8 w-full text-[13px] sm:w-52" />
      <UiTabs v-model="view" :items="viewItems" size="sm" label="Vista" />
    </div>

    <div ref="scroller" class="relative min-h-0 flex-1 overflow-y-auto surface-card">
      <Transition name="fade" mode="out-in">
        <AdminAgendaTimeGrid
          v-if="view === 'day' || view === 'week'"
          :key="`${view}-${view === 'day' ? date : weekStart}-${staffFilter}`"
          :columns="columns"
          :appointments="visible"
          :bounds="bounds"
          @open="selected = $event"
        />
        <AdminAgendaMonth
          v-else-if="view === 'month'"
          :key="`m-${date.slice(0, 7)}`"
          :date="date"
          :appointments="visible"
          @pick-day="pickDay"
          @open="selected = $event"
        />
        <AdminAgendaList v-else :key="`l-${weekStart}`" :from="weekStart" :days="7" :appointments="visible" @open="selected = $event" />
      </Transition>
      <SharedEmptyState
        v-if="view === 'day' && !columns.length"
        icon="lucide:user-x"
        title="Nadie trabaja con este filtro"
        class="absolute inset-0"
      />
    </div>

    <p class="mt-2 hidden items-center gap-4 text-[11px] text-muted md:flex">
      <span class="flex items-center gap-1.5"><Icon name="lucide:mouse-pointer-click" class="size-3.5" />Clic en un hueco para crear</span>
      <span class="flex items-center gap-1.5"><Icon name="lucide:move" class="size-3.5" />Arrastra una cita para moverla</span>
      <span class="flex items-center gap-1.5"><UiKbd>T</UiKbd> hoy · <UiKbd>←</UiKbd><UiKbd>→</UiKbd> navegar · <UiKbd>N</UiKbd> nueva cita</span>
      <span class="ml-auto flex items-center gap-3">
        <span v-for="(s, k) in STATUS_STYLES" :key="k" class="flex items-center gap-1"><span class="size-2 rounded-full" :class="s.dot" />{{ STATUS_META[k].label }}</span>
      </span>
    </p>

    <AdminAppointmentSheet :appointment-id="selected" @close="closeSheet" />
  </div>
</template>
