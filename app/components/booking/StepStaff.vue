<script setup lang="ts">
const { terms } = useAppConfig()
const { booking, capableStaff } = useBooking()
const { nextAvailable, now } = useAvailability()

const today = computed(() => toISODate(now.value))

/** Próximo horario de cada opción, como ayuda para decidir. */
const nextFor = computed(() => {
  const map = new Map<string, string>()
  for (const id of ['any', ...capableStaff.value.map(m => m.id)]) {
    const next = nextAvailable(booking.serviceIds, id, 10)
    map.set(id, next ? `${relativeDayLabel(next.date, today.value)} · ${formatTime(next.slot.start)}` : 'Sin horarios próximos')
  }
  return map
})

const options = computed(() => [
  { id: 'any', name: terms.anyProfessional, role: terms.anyProfessionalHint, photo: undefined as string | undefined, specialties: [] as string[] },
  ...capableStaff.value,
])
</script>

<template>
  <div>
    <header class="mb-6">
      <h1 class="text-2xl font-semibold tracking-tight sm:text-[28px]">
        ¿Con quién?
      </h1>
      <p class="mt-1 text-sm text-muted">
        Elige a tu {{ terms.professional }} o deja que te asignemos el primer horario libre.
      </p>
    </header>

    <SharedEmptyState
      v-if="!capableStaff.length"
      icon="lucide:user-x"
      :title="`Ningún ${terms.professional} realiza todos esos servicios juntos`"
      description="Prueba quitando un servicio y reserva el otro por separado."
      class="surface-card"
    >
      <UiButton variant="outline" size="sm" @click="booking.step = 0">
        <Icon name="lucide:arrow-left" class="size-4" />
        Cambiar servicios
      </UiButton>
    </SharedEmptyState>

    <ul v-else class="stagger grid gap-2.5 sm:grid-cols-2" role="radiogroup" :aria-label="`Elige ${terms.professional}`">
      <li v-for="(member, i) in options" :key="member.id" :style="{ '--i': i }" :class="member.id === 'any' && 'sm:col-span-2'">
        <button
          type="button"
          role="radio"
          :aria-checked="booking.staffId === member.id"
          :class="cn(
            'flex w-full items-center gap-3.5 rounded-[12px] border bg-surface p-3.5 text-left shadow-[inset_0_1px_0_var(--highlight)] transition-all duration-200 hover:border-border-strong',
            booking.staffId === member.id && 'border-accent/70 bg-[color-mix(in_oklab,var(--accent)_7%,var(--surface))] ring-1 ring-accent/40',
          )"
          @click="booking.setStaff(member.id)"
        >
          <span v-if="member.id === 'any'" class="grid size-12 shrink-0 place-items-center rounded-full border border-dashed border-border-strong bg-surface-2">
            <Icon name="lucide:shuffle" class="size-5 text-muted" />
          </span>
          <SharedAvatar v-else :name="member.name" :src="member.photo" class="size-12" />
          <span class="min-w-0 flex-1">
            <span class="block text-[14px] font-medium">{{ member.name }}</span>
            <span class="block truncate text-xs text-muted">{{ member.role }}</span>
            <span class="mt-1.5 inline-flex items-center gap-1 text-[11px] text-muted tabular-nums">
              <span class="size-1.5 rounded-full bg-success" />
              {{ nextFor.get(member.id) }}
            </span>
          </span>
          <span
            :class="cn(
              'grid size-5 shrink-0 place-items-center rounded-full border transition-colors',
              booking.staffId === member.id ? 'border-accent bg-accent text-accent-foreground' : 'border-border-strong',
            )"
            aria-hidden="true"
          >
            <span v-if="booking.staffId === member.id" class="size-1.5 rounded-full bg-current" />
          </span>
        </button>
      </li>
    </ul>
  </div>
</template>
