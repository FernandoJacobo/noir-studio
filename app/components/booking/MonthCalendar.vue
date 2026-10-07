<script setup lang="ts">
import type { ISODate } from '~~/types'

/**
 * Calendario mensual propio, accesible con teclado (patrón "grid" de WAI-ARIA):
 * flechas para moverse, Inicio/Fin para la semana, RePág/AvPág para cambiar de mes y Enter para elegir.
 */
const props = defineProps<{
  today: ISODate
  /** Último día seleccionable. */
  maxDate: ISODate
  isAvailable: (date: ISODate) => boolean
  /** Número de horarios del día (se muestra como indicador). */
  slotCount?: (date: ISODate) => number
}>()

const model = defineModel<ISODate | null>({ default: null })

const visibleMonth = ref(startOfMonth(model.value ?? props.today))
const focused = ref<ISODate>(model.value ?? props.today)

function startOfMonth(iso: ISODate): ISODate {
  return `${iso.slice(0, 7)}-01`
}

const monthLabel = computed(() => formatMonthYear(parseISODate(visibleMonth.value)))
const canPrev = computed(() => visibleMonth.value > startOfMonth(props.today))
const canNext = computed(() => startOfMonth(addMonth(visibleMonth.value, 1)) <= startOfMonth(props.maxDate))

function addMonth(iso: ISODate, n: number): ISODate {
  const d = parseISODate(iso)
  return toISODate(new Date(d.getFullYear(), d.getMonth() + n, 1))
}

const direction = ref<'forward' | 'back'>('forward')

function changeMonth(n: number) {
  if ((n < 0 && !canPrev.value) || (n > 0 && !canNext.value)) return
  direction.value = n > 0 ? 'forward' : 'back'
  visibleMonth.value = addMonth(visibleMonth.value, n)
}

/** 6 semanas × 7 días, iniciando en lunes. */
const weeks = computed(() => {
  const first = startOfWeekISO(visibleMonth.value)
  const month = visibleMonth.value.slice(0, 7)
  return Array.from({ length: 6 }, (_, w) =>
    Array.from({ length: 7 }, (_, d) => {
      const date = addDaysISO(first, w * 7 + d)
      const inMonth = date.startsWith(month)
      const inRange = date >= props.today && date <= props.maxDate
      return {
        date,
        day: Number(date.slice(8)),
        inMonth,
        isToday: date === props.today,
        available: inMonth && inRange && props.isAvailable(date),
        count: inMonth && inRange ? props.slotCount?.(date) ?? 0 : 0,
      }
    }),
  ).filter((week, i) => i < 5 || week.some(d => d.inMonth))
})

const cellRefs = ref<Record<string, HTMLButtonElement | null>>({})

function select(date: ISODate) {
  focused.value = date
  model.value = date
}

function moveFocus(days: number) {
  const target = addDaysISO(focused.value, days)
  if (target < props.today || target > props.maxDate) return
  focused.value = target
  if (!target.startsWith(visibleMonth.value.slice(0, 7))) {
    direction.value = days > 0 ? 'forward' : 'back'
    visibleMonth.value = startOfMonth(target)
  }
  nextTick(() => cellRefs.value[target]?.focus())
}

function onKeydown(e: KeyboardEvent) {
  const map: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }
  if (e.key in map) {
    e.preventDefault()
    moveFocus(map[e.key]!)
  }
  else if (e.key === 'Home') {
    e.preventDefault()
    moveFocus(-((weekdayOf(focused.value) + 6) % 7))
  }
  else if (e.key === 'End') {
    e.preventDefault()
    moveFocus(6 - ((weekdayOf(focused.value) + 6) % 7))
  }
  else if (e.key === 'PageUp' || e.key === 'PageDown') {
    e.preventDefault()
    moveFocus(e.key === 'PageDown' ? 28 : -28)
  }
}

watch(model, (v) => {
  if (v && !v.startsWith(visibleMonth.value.slice(0, 7))) visibleMonth.value = startOfMonth(v)
})
</script>

<template>
  <div class="select-none">
    <div class="mb-3 flex items-center justify-between">
      <p class="text-[15px] font-semibold tracking-tight" aria-live="polite">
        {{ monthLabel }}
      </p>
      <div class="flex gap-1">
        <UiButton variant="ghost" size="icon-sm" :disabled="!canPrev" aria-label="Mes anterior" @click="changeMonth(-1)">
          <Icon name="lucide:chevron-left" class="size-4" />
        </UiButton>
        <UiButton variant="ghost" size="icon-sm" :disabled="!canNext" aria-label="Mes siguiente" @click="changeMonth(1)">
          <Icon name="lucide:chevron-right" class="size-4" />
        </UiButton>
      </div>
    </div>

    <div role="grid" :aria-label="monthLabel" class="overflow-hidden" @keydown="onKeydown">
      <div role="row" class="grid grid-cols-7 pb-1">
        <span v-for="d in WEEK_ORDER" :key="d" role="columnheader" :aria-label="WEEKDAY_LABELS[d]" class="py-1.5 text-center text-[11px] font-medium uppercase tracking-wider text-muted">
          {{ WEEKDAY_SHORT[d].slice(0, 2) }}
        </span>
      </div>
      <Transition :name="`step-${direction}`" mode="out-in">
        <div :key="visibleMonth" class="grid gap-1">
          <div v-for="(week, w) in weeks" :key="w" role="row" class="grid grid-cols-7 gap-1">
            <div v-for="cell in week" :key="cell.date" role="gridcell" :aria-selected="model === cell.date">
              <button
                :ref="(el) => (cellRefs[cell.date] = el as HTMLButtonElement)"
                type="button"
                :tabindex="cell.date === focused ? 0 : -1"
                :disabled="!cell.available"
                :aria-label="`${formatDateLong(cell.date)}${cell.available ? `, ${cell.count} horarios` : ', sin disponibilidad'}`"
                :class="cn(
                  'relative flex aspect-square w-full flex-col items-center justify-center rounded-[10px] text-sm tabular-nums transition-all duration-150',
                  !cell.inMonth && 'invisible',
                  cell.available && model !== cell.date && 'font-medium text-foreground hover:bg-surface-2',
                  !cell.available && 'cursor-not-allowed text-muted/45 line-through decoration-muted/30',
                  model === cell.date && 'scale-[1.04] bg-foreground font-semibold text-background shadow-lg',
                  cell.isToday && model !== cell.date && 'ring-1 ring-inset ring-border-strong',
                )"
                @click="select(cell.date)"
                @focus="focused = cell.date"
              >
                {{ cell.day }}
                <span
                  v-if="cell.available"
                  :class="cn('absolute bottom-1.5 size-1 rounded-full', model === cell.date ? 'bg-background/70' : cell.count > 12 ? 'bg-success' : 'bg-warning')"
                  aria-hidden="true"
                />
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </div>

    <div class="mt-3 flex items-center gap-4 text-[11px] text-muted">
      <span class="inline-flex items-center gap-1.5"><span class="size-1.5 rounded-full bg-success" />Buena disponibilidad</span>
      <span class="inline-flex items-center gap-1.5"><span class="size-1.5 rounded-full bg-warning" />Pocos horarios</span>
    </div>
  </div>
</template>
