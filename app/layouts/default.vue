<template>
  <div class="flex min-h-dvh flex-col">
    <a href="#contenido" class="sr-only z-50 rounded-lg bg-primary px-4 py-2 text-primary-foreground focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
      Saltar al contenido
    </a>
    <LandingNavbar />
    <main id="contenido" class="flex-1">
      <slot />
    </main>
    <LandingFooter />
  </div>
</template>
