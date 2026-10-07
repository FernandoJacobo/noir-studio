<script setup lang="ts">
/** Mini-widget en vivo: "Próximo horario disponible: hoy 4:30 p. m." */
const services = useServicesStore()
const staff = useStaffStore()
const { nextAvailable, now } = useAvailability()

// Usa el servicio más reservado (o el primero activo) como referencia.
const reference = computed(() => services.active.find(s => s.popular) ?? services.active[0])
const next = computed(() => (reference.value ? nextAvailable([reference.value.id]) : null))
const member = computed(() => (next.value ? staff.get(next.value.slot.staffIds[0]!) : undefined))
const dayLabel = computed(() => (next.value ? relativeDayLabel(next.value.date, toISODate(now.value)) : ''))
const mounted = useMounted()
</script>

<template>
  <NuxtLink
    v-if="reference"
    :to="next ? { path: '/reservar', query: { servicio: reference.id } } : '/reservar'"
    class="group inline-flex items-center gap-3 rounded-full border border-border bg-surface/80 py-1.5 pl-1.5 pr-4 shadow-[inset_0_1px_0_var(--highlight)] backdrop-blur transition-colors hover:border-border-strong"
    aria-live="polite"
  >
    <span class="relative">
      <SharedAvatar v-if="member" :name="member.name" :src="member.photo" class="size-8" />
      <span v-else class="grid size-8 place-items-center rounded-full bg-surface-2">
        <Icon name="lucide:clock" class="size-4 text-muted" />
      </span>
      <span class="absolute -bottom-0.5 -right-0.5 flex size-3">
        <span class="absolute inline-flex size-full animate-ping rounded-full bg-success/60 motion-reduce:hidden" />
        <span class="relative inline-flex size-3 rounded-full border-2 border-surface bg-success" />
      </span>
    </span>
    <span class="flex flex-col leading-tight">
      <span class="text-[11px] text-muted">Próximo horario disponible</span>
      <span v-if="!mounted" class="mt-0.5 h-4 w-28 skeleton rounded" />
      <span v-else-if="next" class="text-[13px] font-medium tabular-nums">
        {{ dayLabel }} · {{ formatTime(next.slot.start) }}
        <span v-if="member" class="font-normal text-muted">con {{ member.name.split(' ')[0] }}</span>
      </span>
      <span v-else class="text-[13px] font-medium">Agenda llena esta semana</span>
    </span>
    <Icon name="lucide:arrow-right" class="size-4 text-muted transition-transform group-hover:translate-x-0.5" />
  </NuxtLink>
</template>
