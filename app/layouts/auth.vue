<template>
  <div class="relative isolate grid min-h-dvh place-items-center overflow-hidden px-4 py-12">
    <div class="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
      <div class="absolute inset-0 bg-grid opacity-60 mask-fade-b" />
      <div class="absolute left-1/2 top-0 h-[480px] w-[720px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklab,var(--accent)_12%,transparent),transparent)] blur-2xl" />
    </div>
    <div class="absolute right-4 top-4 flex items-center gap-1">
      <SharedThemeToggle />
    </div>
    <main id="contenido" class="w-full max-w-sm">
      <slot />
    </main>
  </div>
</template>
