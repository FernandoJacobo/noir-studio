<script setup lang="ts">
import { serviceCategories } from '~/data/services'

const { copy } = useAppConfig()
const services = useServicesStore()
const category = ref<string>('all')

const tabs = computed(() => [
  { value: 'all', label: 'Todos' },
  ...serviceCategories
    .filter(c => services.active.some(s => s.category === c.id))
    .map(c => ({ value: c.id as string, label: c.label })),
])

const visible = computed(() =>
  services.active.filter(s => category.value === 'all' || s.category === category.value),
)

const iconFor = (cat: string) => serviceCategories.find(c => c.id === cat)?.icon ?? 'lucide:scissors'
</script>

<template>
  <section id="servicios" class="mx-auto max-w-6xl scroll-mt-20 px-4 py-20 sm:px-6 sm:py-28" aria-labelledby="servicios-title">
    <SharedSectionHeading id="servicios-title" eyebrow="Menú" :title="copy.servicesTitle" :subtitle="copy.servicesSubtitle">
      <div class="-mx-4 overflow-x-auto px-4 scrollbar-none sm:mx-0 sm:px-0">
        <UiTabs v-model="category" :items="tabs" label="Filtrar por categoría" />
      </div>
    </SharedSectionHeading>

    <TransitionGroup tag="ul" name="list" class="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <li v-for="service in visible" :key="service.id" class="group flex flex-col overflow-hidden surface-card transition-[border-color,transform] duration-300 hover:-translate-y-0.5 hover:border-border-strong">
        <div class="relative">
          <SharedImg
            :src="service.image"
            :alt="service.name"
            :icon="iconFor(service.category)"
            :width="720"
            :height="450"
            class="aspect-[16/10]"
            img-class="grayscale-[30%] transition-[filter,transform] duration-700 group-hover:scale-[1.03] group-hover:grayscale-0"
          />
          <div class="absolute left-3 top-3 flex gap-1.5">
            <UiBadge class="border-white/15 bg-black/45 text-white backdrop-blur">
              <Icon :name="iconFor(service.category)" class="size-3" />
              {{ service.category }}
            </UiBadge>
            <UiBadge v-if="service.popular" tone="accent" class="border-accent/40 bg-black/45 text-accent backdrop-blur">
              Popular
            </UiBadge>
          </div>
        </div>
        <div class="flex flex-1 flex-col p-5">
          <div class="flex items-start justify-between gap-3">
            <h3 class="text-[17px] font-semibold tracking-tight">
              {{ service.name }}
            </h3>
            <p class="text-[17px] font-semibold tabular-nums">
              {{ formatPrice(service.price) }}
            </p>
          </div>
          <p class="mt-2 flex-1 text-[13px] leading-relaxed text-muted">
            {{ service.description }}
          </p>
          <div class="mt-5 flex items-center justify-between gap-3 border-t border-border pt-4">
            <span class="inline-flex items-center gap-1.5 text-xs text-muted tabular-nums">
              <Icon name="lucide:clock" class="size-3.5" />
              {{ formatDuration(service.duration) }}
            </span>
            <UiButton :to="{ path: '/reservar', query: { servicio: service.id } }" variant="secondary" size="sm" pill :aria-label="`Reservar este servicio: ${service.name}`">
              Reservar este servicio
              <Icon name="lucide:arrow-right" class="size-3.5" />
            </UiButton>
          </div>
        </div>
      </li>
    </TransitionGroup>
  </section>
</template>
