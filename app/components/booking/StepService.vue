<script setup lang="ts">
import { serviceCategories } from '~/data/services'

const services = useServicesStore()
const booking = useBookingStore()

const groups = computed(() =>
  serviceCategories
    .map(c => ({ ...c, items: services.active.filter(s => s.category === c.id) }))
    .concat([{ id: 'otros', label: 'Otros', icon: 'lucide:sparkles', items: services.active.filter(s => !serviceCategories.some(c => c.id === s.category)) }] as never)
    .filter(g => g.items.length),
)
</script>

<template>
  <div>
    <header class="mb-6">
      <h1 class="text-2xl font-semibold tracking-tight sm:text-[28px]">
        ¿Qué te hacemos hoy?
      </h1>
      <p class="mt-1 text-sm text-muted">
        Puedes elegir uno o varios servicios; sumamos la duración y el total automáticamente.
      </p>
    </header>

    <div class="space-y-8">
      <section v-for="group in groups" :key="group.id" :aria-labelledby="`cat-${group.id}`">
        <h2 :id="`cat-${group.id}`" class="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-muted">
          <Icon :name="group.icon" class="size-3.5" />
          {{ group.label }}
        </h2>
        <ul class="stagger grid gap-2.5 sm:grid-cols-2" role="group" :aria-label="group.label">
          <li v-for="(service, i) in group.items" :key="service.id" :style="{ '--i': i }">
            <button
              type="button"
              role="checkbox"
              :aria-checked="booking.serviceIds.includes(service.id)"
              :class="cn(
                'group relative flex w-full items-start gap-3 rounded-[12px] border bg-surface p-3.5 text-left transition-all duration-200',
                'shadow-[inset_0_1px_0_var(--highlight)] hover:border-border-strong',
                booking.serviceIds.includes(service.id) && 'border-accent/70 bg-[color-mix(in_oklab,var(--accent)_7%,var(--surface))] ring-1 ring-accent/40',
              )"
              @click="booking.toggleService(service.id)"
            >
              <span class="relative shrink-0">
                <SharedImg :src="service.image" alt="" class="size-14 rounded-[9px]" img-class="grayscale-[25%]" />
                <span
                  :class="cn(
                    'absolute -right-1.5 -top-1.5 grid size-5 place-items-center rounded-full border-2 border-surface bg-accent text-accent-foreground transition-all duration-200',
                    booking.serviceIds.includes(service.id) ? 'scale-100 opacity-100' : 'scale-50 opacity-0',
                  )"
                  aria-hidden="true"
                >
                  <Icon name="lucide:check" class="size-3" />
                </span>
              </span>
              <span class="min-w-0 flex-1">
                <span class="flex items-start justify-between gap-2">
                  <span class="text-[14px] font-medium leading-snug">{{ service.name }}</span>
                  <span class="text-[14px] font-semibold tabular-nums">{{ formatPrice(service.price) }}</span>
                </span>
                <span class="mt-1 line-clamp-2 text-xs leading-relaxed text-muted">{{ service.description }}</span>
                <span class="mt-2 inline-flex items-center gap-1 text-[11px] text-muted tabular-nums">
                  <Icon name="lucide:clock" class="size-3" />{{ formatDuration(service.duration) }}
                </span>
              </span>
            </button>
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>
