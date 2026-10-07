<script setup lang="ts">
const { y } = useWindowScroll()
const scrolled = computed(() => y.value > 12)
const menuOpen = ref(false)

const links = [
  { href: '/#servicios', label: 'Servicios' },
  { href: '/#equipo', label: 'Equipo' },
  { href: '/#opiniones', label: 'Opiniones' },
  { href: '/#ubicacion', label: 'Ubicación' },
]

const route = useRoute()
watch(() => route.fullPath, () => (menuOpen.value = false))
</script>

<template>
  <header
    :class="cn(
      'fixed inset-x-0 top-0 z-40 transition-[background-color,border-color,backdrop-filter] duration-300',
      scrolled || menuOpen ? 'border-b border-border bg-background/75 backdrop-blur-xl backdrop-saturate-150' : 'border-b border-transparent',
    )"
  >
    <nav class="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6" aria-label="Principal">
      <NuxtLink to="/" class="rounded-lg">
        <SharedLogo />
      </NuxtLink>

      <ul class="hidden items-center gap-1 md:flex">
        <li v-for="link in links" :key="link.href">
          <NuxtLink :to="link.href" class="rounded-lg px-3 py-2 text-[13px] font-medium text-muted transition-colors hover:text-foreground">
            {{ link.label }}
          </NuxtLink>
        </li>
      </ul>

      <div class="flex items-center gap-1.5">
        <SharedThemeToggle />
        <UiButton to="/reservar" size="sm" pill class="hidden px-4 sm:inline-flex">
          Reservar
          <Icon name="lucide:arrow-up-right" class="size-3.5" />
        </UiButton>
        <button
          type="button"
          class="grid size-9 place-items-center rounded-[10px] text-foreground hover:bg-surface-2 md:hidden"
          :aria-expanded="menuOpen"
          aria-controls="mobile-menu"
          :aria-label="menuOpen ? 'Cerrar menú' : 'Abrir menú'"
          @click="menuOpen = !menuOpen"
        >
          <Icon :name="menuOpen ? 'lucide:x' : 'lucide:menu'" class="size-5" />
        </button>
      </div>
    </nav>

    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      leave-active-class="transition duration-150 ease-in"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div v-if="menuOpen" id="mobile-menu" class="border-t border-border px-4 pb-5 pt-2 md:hidden">
        <ul class="stagger flex flex-col">
          <li v-for="(link, i) in links" :key="link.href" :style="{ '--i': i }">
            <NuxtLink :to="link.href" class="flex items-center justify-between border-b border-border py-3.5 text-[15px] font-medium" @click="menuOpen = false">
              {{ link.label }}
              <Icon name="lucide:arrow-right" class="size-4 text-muted" />
            </NuxtLink>
          </li>
        </ul>
        <UiButton to="/reservar" size="lg" class="mt-5 w-full">
          Reservar cita
        </UiButton>
      </div>
    </Transition>
  </header>
</template>
