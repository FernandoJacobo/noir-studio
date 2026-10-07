<script setup lang="ts">
const { copy } = useAppConfig()
const brand = useBrand()
const settings = useSettingsStore()
const now = useNowTicker()
const todayDow = computed(() => now.value.getDay())

const rows = computed(() => WEEK_ORDER.map(day => ({
  day,
  label: WEEKDAY_LABELS[day],
  ranges: settings.settings.hours[day],
})))

/** Horario continuo del día (aunque el negocio tenga bloques, se muestra apertura–cierre). */
function rangeText(ranges: { start: number, end: number }[] | null) {
  if (!ranges?.length) return 'Cerrado'
  return `${formatTime(ranges[0]!.start)} – ${formatTime(ranges.at(-1)!.end)}`
}
</script>

<template>
  <section class="mx-auto max-w-6xl px-4 pb-20 sm:px-6 sm:pb-28" aria-labelledby="ubicacion-title">
    <SharedSectionHeading id="ubicacion-title" eyebrow="Ubicación" :title="copy.locationTitle" :subtitle="copy.locationSubtitle" />

    <div class="mt-12 grid gap-4 lg:grid-cols-[1.25fr_1fr]">
      <!-- Mapa estilizado (sin iframe para no penalizar el rendimiento) -->
      <a
        :href="brand.mapsUrl"
        target="_blank"
        rel="noopener"
        class="group relative block min-h-[320px] overflow-hidden surface-card"
        :aria-label="`Abrir ${brand.address} en Google Maps`"
      >
        <svg class="absolute inset-0 size-full text-border-strong" preserveAspectRatio="xMidYMid slice" viewBox="0 0 600 400" aria-hidden="true">
          <defs>
            <pattern id="blocks" width="60" height="60" patternUnits="userSpaceOnUse" patternTransform="rotate(-12)">
              <rect width="60" height="60" fill="none" />
              <path d="M0 0H60M0 0V60" stroke="currentColor" stroke-width="0.6" opacity="0.5" />
            </pattern>
          </defs>
          <rect width="600" height="400" fill="url(#blocks)" />
          <path d="M-20 250 C 120 230, 260 260, 620 180" stroke="currentColor" stroke-width="14" fill="none" opacity="0.55" />
          <path d="M210 -20 L 300 420" stroke="currentColor" stroke-width="10" fill="none" opacity="0.45" />
          <path d="M-20 90 L 620 140" stroke="currentColor" stroke-width="6" fill="none" opacity="0.35" />
          <circle cx="430" cy="300" r="46" fill="currentColor" opacity="0.18" />
        </svg>
        <div class="absolute inset-0 bg-[radial-gradient(60%_60%_at_45%_55%,transparent,var(--surface)_95%)]" />

        <div class="absolute left-[45%] top-[55%] -translate-x-1/2 -translate-y-full">
          <div class="relative flex flex-col items-center transition-transform duration-300 group-hover:-translate-y-1">
            <div class="flex items-center gap-2 rounded-full bg-primary py-1.5 pl-1.5 pr-3 text-primary-foreground shadow-xl">
              <SharedLogo compact size="sm" class="[&_rect]:fill-[var(--primary-foreground)] [&_path]:stroke-[var(--primary)]" />
              <span class="text-xs font-semibold">{{ brand.name }}</span>
            </div>
            <span class="h-3 w-px bg-primary" />
            <span class="size-2 rounded-full bg-primary ring-4 ring-primary/20" />
          </div>
        </div>

        <div class="absolute inset-x-4 bottom-4 flex items-center justify-between gap-3 rounded-[10px] border border-border bg-surface/85 px-4 py-3 backdrop-blur">
          <div class="min-w-0">
            <p class="truncate text-[13px] font-medium">
              {{ brand.addressShort }}
            </p>
            <p class="text-xs text-muted">
              {{ brand.city }}
            </p>
          </div>
          <span class="inline-flex shrink-0 items-center gap-1 text-xs font-medium">
            Cómo llegar
            <Icon name="lucide:arrow-up-right" class="size-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </span>
        </div>
      </a>

      <div class="flex flex-col gap-4">
        <div class="surface-card p-5">
          <div class="flex items-center justify-between gap-3">
            <h3 class="text-[15px] font-semibold tracking-tight">
              Horario
            </h3>
            <LandingOpenStatus />
          </div>
          <ul class="mt-4 divide-y divide-border">
            <li
              v-for="row in rows"
              :key="row.day"
              :class="cn('flex items-center justify-between py-2.5 text-[13px]', row.day === todayDow && 'font-medium')"
            >
              <span class="flex items-center gap-2">
                {{ row.label }}
                <UiBadge v-if="row.day === todayDow" tone="accent">Hoy</UiBadge>
              </span>
              <span :class="cn('tabular-nums', !row.ranges && 'text-muted')">{{ rangeText(row.ranges) }}</span>
            </li>
          </ul>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <a :href="`tel:+52${brand.phone}`" class="group surface-card p-4 transition-colors hover:border-border-strong">
            <Icon name="lucide:phone" class="size-4 text-muted" />
            <p class="mt-3 text-xs text-muted">Teléfono</p>
            <p class="text-[13px] font-medium tabular-nums">{{ formatPhone(brand.phone) }}</p>
          </a>
          <a :href="whatsappUrl(brand.whatsapp, `Hola, quiero información sobre ${brand.name}`)" target="_blank" rel="noopener" class="group surface-card p-4 transition-colors hover:border-border-strong">
            <Icon name="lucide:message-circle" class="size-4 text-muted" />
            <p class="mt-3 text-xs text-muted">WhatsApp</p>
            <p class="text-[13px] font-medium">Escríbenos</p>
          </a>
        </div>
      </div>
    </div>
  </section>
</template>
