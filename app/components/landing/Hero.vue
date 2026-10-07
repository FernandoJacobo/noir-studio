<script setup lang="ts">
const { copy, brand } = useAppConfig()
const services = useServicesStore()
const featured = computed(() => services.active.filter(s => s.popular).at(-1) ?? services.active[0])
const rating = copy.heroStats[0]
</script>

<template>
  <section class="relative isolate overflow-hidden pb-16 pt-28 sm:pb-24 sm:pt-36">
    <!-- Fondo: retícula que se desvanece + gradiente radial muy sutil -->
    <div class="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
      <div class="absolute inset-0 bg-grid mask-fade-b opacity-60" />
      <div class="absolute left-1/2 top-[-10%] h-[620px] w-[900px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklab,var(--accent)_14%,transparent),transparent)] blur-2xl" />
    </div>

    <div class="mx-auto grid max-w-6xl items-center gap-14 px-4 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:gap-10">
      <div class="stagger">
        <p class="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-3 py-1 text-xs font-medium text-muted backdrop-blur" style="--i: 0">
          <span class="size-1.5 rounded-full bg-accent" />
          {{ copy.heroEyebrow }}
        </p>

        <h1 class="text-[clamp(2.75rem,8vw,5.25rem)] font-semibold leading-[0.95] tracking-[-0.045em]" style="--i: 1">
          {{ copy.heroTitle }}
          <span class="block text-display text-[1.08em] font-normal leading-[0.95] tracking-[-0.02em] text-accent-ink">
            {{ copy.heroTitleItalic }}
          </span>
        </h1>

        <p class="mt-6 max-w-xl text-base leading-relaxed text-muted sm:text-lg" style="--i: 2">
          {{ copy.heroSubtitle }}
        </p>

        <div class="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center" style="--i: 3">
          <UiButton to="/reservar" size="lg" pill class="px-7">
            {{ copy.heroPrimaryCta }}
            <Icon name="lucide:arrow-right" class="size-4" />
          </UiButton>
          <UiButton to="/#servicios" variant="outline" size="lg" pill class="px-7">
            {{ copy.heroSecondaryCta }}
          </UiButton>
        </div>

        <div class="mt-8" style="--i: 4">
          <LandingNextSlot />
        </div>

        <dl class="mt-10 flex gap-10 border-t border-border pt-6" style="--i: 5">
          <div v-for="stat in copy.heroStats" :key="stat.label">
            <dt class="sr-only">
              {{ stat.label }}
            </dt>
            <dd class="text-2xl font-semibold tracking-tight tabular-nums">
              {{ stat.value }}
            </dd>
            <dd class="mt-0.5 text-xs text-muted">
              {{ stat.label }}
            </dd>
          </div>
        </dl>
      </div>

      <!-- Composición visual -->
      <div class="relative mx-auto w-full max-w-md lg:max-w-none" aria-hidden="true">
        <div class="relative aspect-[4/5] overflow-hidden rounded-[20px] border border-border shadow-[0_40px_80px_-30px_rgb(var(--shadow-color)/0.6)]">
          <SharedImg
            src="https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=900&q=70"
            :alt="`Interior de ${brand.name}`"
            :width="900"
            :height="1125"
            eager
            class="size-full"
            img-class="grayscale-[35%] contrast-[1.05]"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
          <div class="absolute inset-x-0 bottom-0 p-5 text-white">
            <p class="text-display text-3xl leading-none">
              {{ brand.slogan }}
            </p>
            <p class="mt-2 text-xs text-white/70">
              {{ brand.addressShort }}
            </p>
          </div>
        </div>

        <!-- Tarjeta flotante: servicio destacado -->
        <div
          v-if="featured"
          v-motion
          class="absolute -left-4 top-10 w-56 surface-elevated p-3.5 sm:-left-10"
          :initial="{ opacity: 0, y: 12 }"
          :enter="{ opacity: 1, y: 0, transition: { delay: 350, duration: 500 } }"
        >
          <p class="text-[11px] font-medium uppercase tracking-wider text-muted">
            Más pedido
          </p>
          <p class="mt-1 text-sm font-semibold">
            {{ featured.name }}
          </p>
          <div class="mt-3 flex items-center justify-between text-xs">
            <span class="inline-flex items-center gap-1 text-muted"><Icon name="lucide:clock" class="size-3.5" />{{ formatDuration(featured.duration) }}</span>
            <span class="font-semibold tabular-nums">{{ formatPrice(featured.price) }}</span>
          </div>
        </div>

        <!-- Tarjeta flotante: reseñas -->
        <div
          v-motion
          class="absolute -right-3 bottom-24 surface-elevated px-3.5 py-3 sm:-right-8"
          :initial="{ opacity: 0, y: 12 }"
          :enter="{ opacity: 1, y: 0, transition: { delay: 500, duration: 500 } }"
        >
          <div class="flex gap-0.5 text-accent">
            <Icon v-for="n in 5" :key="n" name="lucide:star" class="size-3.5 fill-current" />
          </div>
          <p v-if="rating" class="mt-1.5 text-xs font-medium">
            {{ rating.value }} {{ rating.label }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
