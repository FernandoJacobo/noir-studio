<script setup lang="ts">
const { brand, copy, author } = useAppConfig()
const year = new Date().getFullYear()
</script>

<template>
  <footer class="border-t border-border">
    <!-- CTA final -->
    <div class="relative isolate overflow-hidden border-b border-border">
      <div class="absolute inset-0 -z-10 bg-grid opacity-50 mask-fade-b" aria-hidden="true" />
      <div class="mx-auto flex max-w-6xl flex-col items-start gap-6 px-4 py-16 sm:px-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 class="max-w-xl text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
            {{ copy.ctaTitle }}
          </h2>
          <p class="mt-2 text-[15px] text-muted">
            {{ copy.ctaSubtitle }}
          </p>
        </div>
        <UiButton to="/reservar" size="lg" pill class="px-7">
          {{ copy.heroPrimaryCta }}
          <Icon name="lucide:arrow-right" class="size-4" />
        </UiButton>
      </div>
    </div>

    <div class="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.5fr_1fr_1fr]">
      <div>
        <SharedLogo />
        <p class="mt-4 max-w-xs text-[13px] leading-relaxed text-muted">
          {{ brand.giro }} en {{ brand.city }}. {{ brand.slogan }}
        </p>
        <ul class="mt-5 flex gap-2">
          <li v-for="s in brand.social" :key="s.label">
            <a :href="s.href" target="_blank" rel="noopener" :aria-label="s.label" class="grid size-9 place-items-center rounded-full border border-border text-muted transition-colors hover:border-border-strong hover:text-foreground">
              <Icon :name="s.icon" class="size-4" />
            </a>
          </li>
        </ul>
      </div>
      <nav aria-label="Pie de página">
        <p class="text-xs font-medium uppercase tracking-wider text-muted">
          Explorar
        </p>
        <ul class="mt-4 space-y-2.5 text-[13px]">
          <li><NuxtLink to="/#servicios" class="hover:underline">Servicios</NuxtLink></li>
          <li><NuxtLink to="/#equipo" class="hover:underline">Equipo</NuxtLink></li>
          <li><NuxtLink to="/reservar" class="hover:underline">Reservar cita</NuxtLink></li>
          <li><NuxtLink to="/admin" class="hover:underline">Panel de administración</NuxtLink></li>
        </ul>
      </nav>
      <div>
        <p class="text-xs font-medium uppercase tracking-wider text-muted">
          Contacto
        </p>
        <ul class="mt-4 space-y-2.5 text-[13px]">
          <li><a :href="`tel:+52${brand.phone}`" class="tabular-nums hover:underline">{{ formatPhone(brand.phone) }}</a></li>
          <li><a :href="`mailto:${brand.email}`" class="hover:underline">{{ brand.email }}</a></li>
          <li class="text-muted">
            {{ brand.address }}
          </li>
        </ul>
        <div class="mt-5">
          <SharedThemeSelect />
        </div>
      </div>
    </div>

    <div class="border-t border-border">
      <div class="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-5 text-xs text-muted sm:flex-row sm:px-6">
        <p>© {{ year }} {{ brand.name }} · Marca ficticia para fines de demostración.</p>
        <a :href="author.url" target="_blank" rel="noopener" class="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 transition-colors hover:border-border-strong hover:text-foreground">
          <span class="size-1.5 rounded-full bg-accent" />
          Demo desarrollado por <span class="font-medium text-foreground">{{ author.name }}</span> · {{ author.label }}
        </a>
      </div>
    </div>
  </footer>
</template>
