<script setup lang="ts">
import { toast } from 'vue-sonner'
import type { AgendaColumn, Appointment, Minutes, TimeRange } from '~~/types'

const props = defineProps<{
  columns: AgendaColumn[]
  appointments: Appointment[]
  bounds: TimeRange
}>()
const emit = defineEmits<{ open: [string] }>()

const PPM = 1.4 // píxeles por minuto (84 px por hora)
const SNAP = 15

const ui = useUiStore()
const store = useAppointmentsStore()
const staff = useStaffStore()
const clients = useClientsStore()
const services = useServicesStore()
const settings = useSettingsStore()
const now = useNowTicker()

const height = computed(() => (props.bounds.end - props.bounds.start) * PPM)
const hours = computed(() => {
  const list: Minutes[] = []
  for (let m = Math.ceil(props.bounds.start / 60) * 60; m <= props.bounds.end; m += 60) list.push(m)
  return list
})
const nowMin = computed(() => minutesOfDay(now.value))
const today = computed(() => toISODate(now.value))
const showNow = computed(() => nowMin.value >= props.bounds.start && nowMin.value <= props.bounds.end)
const top = (min: Minutes) => (min - props.bounds.start) * PPM

/** Citas de cada columna con su carril (para traslapes entre profesionales en la vista semana). */
const columnItems = computed(() => props.columns.map((col) => {
  const items = props.appointments.filter(a => a.date === col.date && (!col.staffId || a.staffId === col.staffId))
  const lanes = layoutOverlaps(items.map(a => ({ id: a.id, start: a.start, end: a.start + a.duration })))
  return items.map(a => ({ a, lane: lanes.get(a.id)! }))
}))

/** Bloques no laborables para sombrear. */
function offRanges(col: AgendaColumn): TimeRange[] {
  const out: TimeRange[] = []
  let cursor = props.bounds.start
  for (const r of col.ranges) {
    if (r.start > cursor) out.push({ start: cursor, end: r.start })
    cursor = Math.max(cursor, r.end)
  }
  if (cursor < props.bounds.end) out.push({ start: cursor, end: props.bounds.end })
  return out
}

// ── Crear en hueco ─────────────────────────────────────────────
function onColumnClick(e: MouseEvent, col: AgendaColumn) {
  if ((e.target as HTMLElement).closest('[data-block]')) return
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
  const minute = props.bounds.start + Math.floor((e.clientY - rect.top) / PPM / SNAP) * SNAP
  ui.openNewAppointment({ date: col.date, start: minute, staffId: col.staffId })
}

// ── Arrastrar para mover ───────────────────────────────────────
const columnEls = ref<HTMLElement[]>([])
const drag = ref<{ id: string, x: number, y: number, origStart: Minutes, duration: Minutes, fromCol: number, toCol: number, delta: Minutes, moved: boolean } | null>(null)

function onPointerDown(e: PointerEvent, a: Appointment, colIndex: number) {
  if (e.button !== 0 || a.status === 'completed') return
  ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  drag.value = { id: a.id, x: e.clientX, y: e.clientY, origStart: a.start, duration: a.duration, fromCol: colIndex, toCol: colIndex, delta: 0, moved: false }
}

function onPointerMove(e: PointerEvent) {
  const d = drag.value
  if (!d) return
  const dx = e.clientX - d.x
  const dy = e.clientY - d.y
  if (!d.moved && Math.hypot(dx, dy) < 5) return
  d.moved = true
  const raw = Math.round(dy / PPM / SNAP) * SNAP
  d.delta = Math.max(props.bounds.start - d.origStart, Math.min(props.bounds.end - d.duration - d.origStart, raw))
  const idx = columnEls.value.findIndex((el) => {
    const r = el.getBoundingClientRect()
    return e.clientX >= r.left && e.clientX < r.right
  })
  if (idx !== -1) d.toCol = idx
}

function onPointerUp(a: Appointment) {
  const d = drag.value
  drag.value = null
  if (!d) return
  if (!d.moved) {
    emit('open', a.id)
    return
  }
  const col = props.columns[d.toCol]!
  const target = { date: col.date, start: d.origStart + d.delta, staffId: col.staffId ?? a.staffId }
  if (target.date === a.date && target.start === a.start && target.staffId === a.staffId) return

  const member = staff.get(target.staffId)
  if (!member || !canPerformAll(member, a.serviceIds)) {
    toast.error(`${member?.name ?? 'Ese profesional'} no realiza estos servicios`)
    return
  }
  if (!fitsSchedule(member, settings.settings.hours, target.date, target.start, a.duration)) {
    toast.error('Fuera del horario laboral', { description: `${member.name} no trabaja en ese horario.` })
    return
  }
  const previous = { date: a.date, start: a.start, staffId: a.staffId }
  try {
    store.reschedule(a.id, target)
    toast.success('Cita movida', {
      description: `${formatDateShort(target.date)}, ${formatTime(target.start)} · ${member.name}`,
      action: { label: 'Deshacer', onClick: () => store.reschedule(a.id, previous) },
    })
  }
  catch (err) {
    if (err instanceof ConflictError) {
      toast.error('Conflicto de horario', { description: `Se traslapa con ${clients.get(err.conflict.clientId)?.name ?? 'otra cita'} (${formatTime(err.conflict.start)}).` })
    }
    else throw err
  }
}

function onKeyOpen(e: KeyboardEvent, id: string) {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    emit('open', id)
  }
}

const dragTimeLabel = computed(() => (drag.value?.moved ? formatTime(drag.value.origStart + drag.value.delta) : ''))
</script>

<template>
  <div class="overflow-x-auto">
    <div class="min-w-fit" :style="{ minWidth: `${56 + columns.length * 120}px` }">
      <!-- Encabezados -->
      <div class="sticky top-0 z-20 flex border-b border-border bg-surface/95 backdrop-blur">
        <div class="w-14 shrink-0" />
        <div v-for="col in columns" :key="col.key" class="flex min-w-[120px] flex-1 items-center gap-2 border-l border-border px-3 py-2.5">
          <SharedAvatar v-if="col.staffId" :name="col.label" :src="col.photo" class="size-7 text-[9px]" />
          <div class="min-w-0">
            <p :class="cn('truncate text-[13px] font-medium', col.isToday && !col.staffId && 'text-now')">
              {{ col.label }}
            </p>
            <p v-if="col.sublabel" class="truncate text-[11px] text-muted">
              {{ col.sublabel }}
            </p>
          </div>
          <span v-if="col.isToday && !col.staffId" class="ml-auto rounded-full bg-now px-1.5 text-[10px] font-semibold leading-4 text-white">Hoy</span>
        </div>
      </div>

      <!-- Cuerpo -->
      <div class="relative flex" :style="{ height: `${height}px` }">
        <!-- Horas -->
        <div class="relative w-14 shrink-0" aria-hidden="true">
          <span
            v-for="h in hours"
            :key="h"
            class="absolute right-2 -translate-y-1/2 text-[10px] font-medium text-muted tabular-nums"
            :style="{ top: `${top(h)}px` }"
          >{{ h === bounds.start ? '' : formatTime(h, { compact: true }) }}</span>
        </div>

        <!-- Líneas horizontales -->
        <div class="pointer-events-none absolute inset-y-0 left-14 right-0" aria-hidden="true">
          <div v-for="h in hours" :key="h" class="absolute inset-x-0 border-t border-border" :style="{ top: `${top(h)}px` }" />
          <div v-for="h in hours.slice(0, -1)" :key="`half-${h}`" class="absolute inset-x-0 border-t border-dashed border-border/50" :style="{ top: `${top(h + 30)}px` }" />
        </div>

        <!-- Columnas -->
        <div
          v-for="(col, ci) in columns"
          :key="col.key"
          :ref="(el) => { if (el) columnEls[ci] = el as HTMLElement }"
          :class="cn('relative min-w-[120px] flex-1 cursor-cell border-l border-border', drag?.moved && drag.toCol === ci && 'bg-accent/5')"
          role="group"
          :aria-label="`${col.label}${col.sublabel ? `, ${col.sublabel}` : ''}`"
          @click="onColumnClick($event, col)"
        >
          <!-- No laborable -->
          <div
            v-for="(r, ri) in offRanges(col)"
            :key="ri"
            class="pointer-events-none absolute inset-x-0 bg-[repeating-linear-gradient(135deg,transparent_0_6px,color-mix(in_oklab,var(--foreground)_4%,transparent)_6px_7px)] bg-surface-2/40"
            :style="{ top: `${top(r.start)}px`, height: `${(r.end - r.start) * PPM}px` }"
          />

          <!-- Línea de "ahora" -->
          <div
            v-if="showNow && col.date === today"
            class="pointer-events-none absolute inset-x-0 z-10 border-t-2 border-now"
            :style="{ top: `${top(nowMin)}px` }"
            aria-hidden="true"
          >
            <span v-if="ci === 0 || columns[ci - 1]?.date !== today" class="absolute -left-[5px] -top-[6px] size-2.5 rounded-full bg-now" />
          </div>

          <!-- Citas -->
          <div
            v-for="{ a, lane } in columnItems[ci]"
            :key="a.id"
            data-block
            role="button"
            tabindex="0"
            :aria-label="`${clients.get(a.clientId)?.name}, ${formatTimeRange(a.start, a.duration)}, ${STATUS_META[a.status].label}`"
            :class="cn(
              'group absolute z-[5] flex touch-none select-none flex-col overflow-hidden rounded-[8px] border py-1 pl-2.5 pr-1.5 text-left shadow-[0_1px_2px_rgb(var(--shadow-color)/0.08)] transition-[box-shadow,opacity] hover:z-[15] hover:shadow-lg focus-visible:z-[15]',
              STATUS_STYLES[a.status].block,
              a.status === 'completed' ? 'cursor-pointer opacity-70' : 'cursor-grab active:cursor-grabbing',
              drag?.id === a.id && drag.moved && 'opacity-35',
            )"
            :style="{
              top: `${top(a.start) + 1}px`,
              height: `${a.duration * PPM - 2}px`,
              left: `calc(${(lane.col / lane.cols) * 100}% + 3px)`,
              width: `calc(${100 / lane.cols}% - 6px)`,
            }"
            @pointerdown="onPointerDown($event, a, ci)"
            @pointermove="onPointerMove"
            @pointerup="onPointerUp(a)"
            @pointercancel="drag = null"
            @keydown="onKeyOpen($event, a.id)"
          >
            <span class="absolute inset-y-1 left-1 w-[3px] rounded-full" :class="STATUS_STYLES[a.status].bar" />
            <span class="truncate text-[12px] font-medium leading-tight">{{ clients.get(a.clientId)?.name ?? 'Cliente' }}</span>
            <span class="truncate text-[11px] leading-tight text-muted tabular-nums">{{ formatTime(a.start) }}<template v-if="a.duration >= 45"> · {{ services.resolve(a.serviceIds).map(s => s.name).join(' + ') }}</template></span>
            <span v-if="!col.staffId && a.duration >= 60" class="mt-auto flex items-center gap-1 text-[10px] text-muted">
              <SharedAvatar :name="staff.get(a.staffId)?.name ?? '?'" :src="staff.get(a.staffId)?.photo" class="size-4 text-[7px]" />
              <span class="truncate">{{ staff.get(a.staffId)?.name.split(' ')[0] }}</span>
            </span>
          </div>

          <!-- Vista previa al arrastrar -->
          <div
            v-if="drag?.moved && drag.toCol === ci"
            class="pointer-events-none absolute inset-x-1 z-20 rounded-[8px] border-2 border-dashed border-accent bg-accent/15"
            :style="{ top: `${top(drag.origStart + drag.delta) + 1}px`, height: `${drag.duration * PPM - 2}px` }"
          >
            <span class="absolute -top-5 left-0 rounded bg-accent px-1.5 text-[10px] font-semibold text-accent-foreground tabular-nums">{{ dragTimeLabel }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
