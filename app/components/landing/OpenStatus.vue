<script setup lang="ts">
/** Indicador en vivo: "Abierto ahora · Cierra a las 8:00 p. m." */
const settings = useSettingsStore()
const now = useNowTicker()

const status = computed(() => openStatus(settings.settings.hours, now.value))
const text = computed(() => {
  const s = status.value
  if (s.open) return `Cierra a las ${formatTime(s.closesAt!)}`
  if (s.opensAt) {
    const day = relativeDayLabel(s.opensAt.date, toISODate(now.value))
    return `Abre ${day === 'Hoy' ? 'hoy' : day === 'Mañana' ? 'mañana' : `el ${formatDateFns(s.opensAt.date, 'EEEE')}`} a las ${formatTime(s.opensAt.start)}`
  }
  return 'Consulta horarios'
})
</script>

<template>
  <span class="inline-flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px]" role="status">
    <span :class="cn('inline-flex items-center gap-1.5 font-medium', status.open ? 'text-success' : 'text-danger')">
      <span class="relative flex size-2">
        <span v-if="status.open" class="absolute inline-flex size-full animate-ping rounded-full bg-success/60 motion-reduce:hidden" />
        <span :class="cn('relative inline-flex size-2 rounded-full', status.open ? 'bg-success' : 'bg-danger')" />
      </span>
      {{ status.open ? 'Abierto ahora' : 'Cerrado' }}
    </span>
    <span class="text-muted">· {{ text }}</span>
  </span>
</template>
