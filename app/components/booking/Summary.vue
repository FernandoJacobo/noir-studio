<script setup lang="ts">
/** Contenido del resumen (se usa en el panel lateral y en el bottom sheet móvil). */
const { booking, selectedServices, totals, chosenStaff, assignedStaff } = useBooking()
const { terms } = useAppConfig()

const staffLabel = computed(() => {
  if (assignedStaff.value && booking.start !== null) return assignedStaff.value.name
  if (chosenStaff.value) return chosenStaff.value.name
  if (booking.staffId === 'any') return terms.anyProfessional
  return null
})
</script>

<template>
  <dl class="space-y-4 text-[13px]">
    <div>
      <dt class="mb-1.5 text-[11px] font-medium uppercase tracking-wider text-muted">
        Servicios
      </dt>
      <dd v-if="selectedServices.length">
        <TransitionGroup tag="ul" name="list" class="space-y-1.5">
          <li v-for="s in selectedServices" :key="s.id" class="flex items-baseline justify-between gap-3">
            <span class="truncate">{{ s.name }}</span>
            <span class="shrink-0 tabular-nums text-muted">{{ formatPrice(s.price) }}</span>
          </li>
        </TransitionGroup>
      </dd>
      <dd v-else class="text-muted">
        Ninguno aún
      </dd>
    </div>

    <div class="flex items-center justify-between gap-3 border-t border-border pt-4">
      <dt class="text-muted">
        Con
      </dt>
      <dd class="flex items-center gap-2 font-medium">
        <SharedAvatar v-if="assignedStaff || chosenStaff" :name="(assignedStaff ?? chosenStaff)!.name" :src="(assignedStaff ?? chosenStaff)!.photo" class="size-5 text-[8px]" />
        {{ staffLabel ?? '—' }}
      </dd>
    </div>

    <div class="flex items-center justify-between gap-3">
      <dt class="text-muted">
        Cuándo
      </dt>
      <dd class="text-right font-medium tabular-nums">
        <template v-if="booking.date && booking.start !== null">
          {{ formatDateShort(booking.date) }} · {{ formatTime(booking.start) }}
        </template>
        <template v-else>
          —
        </template>
      </dd>
    </div>

    <div class="flex items-center justify-between gap-3">
      <dt class="text-muted">
        Duración
      </dt>
      <dd class="tabular-nums">
        {{ totals.duration ? formatDuration(totals.duration) : '—' }}
      </dd>
    </div>

    <div class="flex items-baseline justify-between gap-3 border-t border-border pt-4">
      <dt class="font-medium">
        Total
      </dt>
      <dd class="text-xl font-semibold tabular-nums tracking-tight">
        <Transition name="fade" mode="out-in">
          <span :key="totals.price">{{ formatPrice(totals.price) }}</span>
        </Transition>
      </dd>
    </div>
  </dl>
</template>
