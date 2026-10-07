<script setup lang="ts">
/** Layout enfocado para el flujo de reservación: sin distracciones. */
</script>

<template>
  <div class="flex min-h-dvh flex-col">
    <header class="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-xl">
      <div class="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <NuxtLink to="/" aria-label="Volver al inicio" class="rounded-lg">
          <SharedLogo size="sm" />
        </NuxtLink>
        <div class="flex items-center gap-1">
          <SharedThemeToggle />
          <UiButton to="/" variant="ghost" size="sm">
            <Icon name="lucide:x" class="size-4" />
            <span class="hidden sm:inline">Salir</span>
          </UiButton>
        </div>
      </div>
    </header>
    <main id="contenido" class="flex-1">
      <slot />
    </main>
  </div>
</template>
