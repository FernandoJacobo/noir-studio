<script setup lang="ts">
import type { Appointment, ISODate } from '~~/types'

const props = defineProps<{ date: ISODate, appointments: Appointment[] }>()
const emit = defineEmits<{ pickDay: [ISODate], open: [string] }>()

const NBSP = String.fromCharCode(160)
const clients = useClientsStore()
const settings = useSettingsStore()
const now = useNowTicker()
const today = computed(() => toISODate(now.value))

const weeks = computed(() => {
  const month = props.date.slice(0, 7)
  const first = startOfWeekISO(`${month}-01`)
  const rows = Array.from({ length: 6 }, (_, w) => Array.from({ length: 7 }, (_, d) => {
    const date = addDaysISO(first, w * 7 + d)
    const items = props.appointments.filter(a => a.date === date)
    return { date, inMonth: date.startsWith(month), closed: !settings.settings.hours[weekdayOf(date)]?.length, items }
  }))
  return rows.filter((row, i) => i < 5 || row.some(c => c.inMonth))
})
</script>

<template>
  <div class="overflow-x-auto">
    <div class="min-w-[720px]">
      <div class="grid grid-cols-7 border-b border-border">
        <div v-for="d in WEEK_ORDER" :key="d" class="px-3 py-2 text-[11px] font-medium uppercase tracking-wider text-muted">
          {{ WEEKDAY_SHORT[d] }}
        </div>
      </div>
      <div class="grid grid-cols-7">
        <template v-for="(week, w) in weeks" :key="w">
          <div
            v-for="cell in week"
            :key="cell.date"
            :class="cn(
              'group relative min-h-[118px] border-b border-r border-border p-1.5 transition-colors [&:nth-child(7n)]:border-r-0',
              !cell.inMonth && 'bg-surface-2/30',
              cell.closed && cell.inMonth && 'bg-[repeating-linear-gradient(135deg,transparent_0_6px,color-mix(in_oklab,var(--foreground)_3%,transparent)_6px_7px)]',
            )"
          >
            <button
              type="button"
              :class="cn(
                'mb-1 grid size-6 place-items-center rounded-full text-xs tabular-nums transition-colors hover:bg-surface-2',
                !cell.inMonth && 'text-muted/50',
                cell.date === today && 'bg-now font-semibold text-white hover:bg-now',
              )"
              :aria-label="`Ver ${formatDateLong(cell.date)}`"
              @click="emit('pickDay', cell.date)"
            >
              {{ Number(cell.date.slice(8)) }}
            </button>
            <ul class="space-y-0.5">
              <li v-for="a in cell.items.slice(0, 3)" :key="a.id">
                <button
                  type="button"
                  class="flex w-full items-center gap-1.5 truncate rounded-[5px] px-1 py-0.5 text-left text-[11px] hover:bg-surface-2"
                  @click="emit('open', a.id)"
                >
                  <span class="size-1.5 shrink-0 rounded-full" :class="STATUS_STYLES[a.status].dot" />
                  <span class="tabular-nums text-muted">{{ formatTime(a.start, { compact: true }).replaceAll(NBSP, '') }}</span>
                  <span class="truncate">{{ clients.get(a.clientId)?.name.split(' ')[0] }}</span>
                </button>
              </li>
            </ul>
            <button v-if="cell.items.length > 3" type="button" class="mt-0.5 px-1 text-[11px] font-medium text-muted hover:text-foreground" @click="emit('pickDay', cell.date)">
              +{{ cell.items.length - 3 }} más
            </button>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
