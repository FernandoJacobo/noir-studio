<script setup lang="ts">
import type { DaySchedule, Weekday, WeeklySchedule } from '~~/types'

/**
 * Editor visual de horario semanal: por día, activar/desactivar y editar bloques
 * (p. ej. 10:00–14:00 y 15:00–20:00). Muestra una barra con la jornada sobre el horario del negocio.
 */
const props = defineProps<{
  /** Si se pasa, se dibuja como referencia y limita los bloques. */
  businessHours?: WeeklySchedule
}>()
const model = defineModel<WeeklySchedule>({ required: true })

const bounds = computed(() => weekBounds(props.businessHours ?? model.value))
const span = computed(() => Math.max(60, bounds.value.end - bounds.value.start))
const pct = (m: number) => `${((m - bounds.value.start) / span.value) * 100}%`

const timeOptions = computed(() => {
  const list: { value: string, label: string }[] = []
  for (let m = 6 * 60; m <= 23 * 60; m += 30) list.push({ value: minutesToHHMM(m), label: formatTime(m) })
  return list
})

function setDay(day: Weekday, value: DaySchedule) {
  model.value = { ...model.value, [day]: value }
}

function toggle(day: Weekday, on: boolean) {
  const business = props.businessHours?.[day]
  setDay(day, on ? (business?.length ? business.map(r => ({ ...r })) : [{ start: 10 * 60, end: 18 * 60 }]) : null)
}

function updateRange(day: Weekday, i: number, key: 'start' | 'end', value: string) {
  const ranges = [...(model.value[day] ?? [])]
  ranges[i] = { ...ranges[i]!, [key]: hhmmToMinutes(value) }
  setDay(day, ranges.sort((a, b) => a.start - b.start))
}

/** Parte un bloque en dos agregando una pausa de una hora a la mitad. */
function addBreak(day: Weekday) {
  const ranges = model.value[day] ?? []
  const last = ranges.at(-1)
  if (!last || last.end - last.start < 180) return
  const mid = Math.round((last.start + last.end) / 2 / 60) * 60
  setDay(day, [...ranges.slice(0, -1), { start: last.start, end: mid }, { start: mid + 60, end: last.end }])
}

function removeRange(day: Weekday, i: number) {
  const ranges = (model.value[day] ?? []).filter((_, idx) => idx !== i)
  setDay(day, ranges.length ? ranges : null)
}

const invalid = (day: Weekday) => (model.value[day] ?? []).some((r, i, arr) => r.end <= r.start || (i > 0 && r.start < arr[i - 1]!.end))
</script>

<template>
  <ul class="divide-y divide-border rounded-[12px] border border-border">
    <li v-for="day in WEEK_ORDER" :key="day" class="grid gap-3 p-3 sm:grid-cols-[150px_minmax(0,1fr)] sm:items-center">
      <label class="flex items-center gap-2.5 text-[13px] font-medium">
        <UiSwitch :model-value="!!model[day]?.length" :label="`${WEEKDAY_LABELS[day]} laborable`" @update:model-value="toggle(day, $event)" />
        {{ WEEKDAY_LABELS[day] }}
      </label>

      <div v-if="model[day]?.length" class="space-y-2">
        <!-- Barra visual de la jornada -->
        <div class="relative h-2 overflow-hidden rounded-full bg-surface-2" aria-hidden="true">
          <div
            v-for="(b, i) in businessHours?.[day] ?? []"
            :key="`b${i}`"
            class="absolute inset-y-0 bg-border-strong/50"
            :style="{ left: pct(b.start), width: `calc(${pct(b.end)} - ${pct(b.start)})` }"
          />
          <div
            v-for="(r, i) in model[day]"
            :key="i"
            class="absolute inset-y-0 rounded-full bg-accent"
            :style="{ left: pct(r.start), width: `calc(${pct(r.end)} - ${pct(r.start)})` }"
          />
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <div v-for="(r, i) in model[day]" :key="i" class="flex items-center gap-1.5">
            <span v-if="i > 0" class="px-1 text-xs text-muted">pausa</span>
            <UiSelect :model-value="minutesToHHMM(r.start)" :options="timeOptions" :label="`Inicio bloque ${i + 1}`" class="h-8 w-[118px] text-xs" @update:model-value="updateRange(day, i, 'start', $event as string)" />
            <span class="text-xs text-muted">–</span>
            <UiSelect :model-value="minutesToHHMM(r.end)" :options="timeOptions" :label="`Fin bloque ${i + 1}`" class="h-8 w-[118px] text-xs" @update:model-value="updateRange(day, i, 'end', $event as string)" />
            <UiButton v-if="model[day]!.length > 1" variant="ghost" size="icon-sm" :aria-label="`Quitar bloque ${i + 1}`" @click="removeRange(day, i)">
              <Icon name="lucide:x" class="size-3.5" />
            </UiButton>
          </div>
          <UiButton v-if="model[day]!.length === 1" variant="ghost" size="xs" @click="addBreak(day)">
            <Icon name="lucide:coffee" class="size-3.5" />
            Agregar pausa
          </UiButton>
          <span v-if="invalid(day)" class="text-xs text-danger" role="alert">Revisa los horarios</span>
        </div>
      </div>
      <p v-else class="text-[13px] text-muted">
        {{ businessHours && !businessHours[day]?.length ? 'El negocio cierra' : 'Descanso' }}
      </p>
    </li>
  </ul>
</template>
