<script setup lang="ts">
import type { ISODate, StaffMember } from '~~/types'

const props = defineProps<{ member: StaffMember, date: ISODate }>()
const settings = useSettingsStore()
const appointments = useAppointmentsStore()

const capacity = computed(() => getWorkingRanges(props.member, settings.settings.hours, props.date).reduce((s, r) => s + r.end - r.start, 0))
const booked = computed(() => appointments.forDate(props.date).filter(a => a.staffId === props.member.id && a.status !== 'cancelled').reduce((s, a) => s + a.duration, 0))
const pct = computed(() => (capacity.value ? Math.min(100, Math.round((booked.value / capacity.value) * 100)) : 0))
</script>

<template>
  <div class="flex items-center gap-2">
    <div class="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-2" role="meter" :aria-valuenow="pct" aria-valuemin="0" aria-valuemax="100" :aria-label="`Ocupación de ${member.name}`">
      <div class="h-full rounded-full bg-foreground/70 transition-[width] duration-700" :style="{ width: `${pct}%` }" />
    </div>
    <span class="w-14 text-right text-[11px] text-muted tabular-nums">{{ capacity ? `${pct}%` : 'Descansa' }}</span>
  </div>
</template>
