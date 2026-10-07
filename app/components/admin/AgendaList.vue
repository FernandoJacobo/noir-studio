<script setup lang="ts">
import type { Appointment, ISODate } from '~~/types'

/** Vista de lista para móvil: próximos días agrupados. */
const props = defineProps<{ from: ISODate, days: number, appointments: Appointment[] }>()
const emit = defineEmits<{ open: [string] }>()

const clients = useClientsStore()
const services = useServicesStore()
const staff = useStaffStore()
const now = useNowTicker()
const today = computed(() => toISODate(now.value))

const groups = computed(() => Array.from({ length: props.days }, (_, i) => {
  const date = addDaysISO(props.from, i)
  return { date, items: props.appointments.filter(a => a.date === date) }
}).filter(g => g.items.length))
</script>

<template>
  <div>
    <SharedEmptyState v-if="!groups.length" icon="lucide:calendar-check" title="Sin citas en estos días" description="Cambia de semana o agenda una nueva cita." />
    <section v-for="g in groups" :key="g.date" class="border-b border-border last:border-0">
      <h3 class="sticky top-0 z-10 flex items-center justify-between bg-surface/95 px-4 py-2.5 text-[13px] font-medium backdrop-blur">
        <span class="first-letter:uppercase">{{ relativeDayLabel(g.date, today) === formatDateShort(g.date) ? formatDateLong(g.date) : `${relativeDayLabel(g.date, today)} · ${formatDateShort(g.date)}` }}</span>
        <UiBadge>{{ g.items.length }}</UiBadge>
      </h3>
      <ul class="divide-y divide-border">
        <li v-for="a in g.items" :key="a.id">
          <button type="button" class="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-surface-2/50" @click="emit('open', a.id)">
            <div class="w-16 shrink-0">
              <p class="text-[13px] font-medium tabular-nums">
                {{ formatTime(a.start) }}
              </p>
              <p class="text-[11px] text-muted tabular-nums">
                {{ formatDuration(a.duration) }}
              </p>
            </div>
            <span class="h-9 w-[3px] shrink-0 rounded-full" :class="STATUS_STYLES[a.status].bar" />
            <div class="min-w-0 flex-1">
              <p class="truncate text-[13px] font-medium">
                {{ clients.get(a.clientId)?.name }}
              </p>
              <p class="truncate text-xs text-muted">
                {{ services.resolve(a.serviceIds).map(s => s.name).join(' + ') }}
              </p>
            </div>
            <SharedAvatar :name="staff.get(a.staffId)?.name ?? '?'" :src="staff.get(a.staffId)?.photo" class="size-7 text-[9px]" />
          </button>
        </li>
      </ul>
    </section>
  </div>
</template>
