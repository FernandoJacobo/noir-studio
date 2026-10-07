<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()
const is404 = computed(() => props.error.statusCode === 404)

useSeoMeta({ title: () => (is404.value ? 'Página no encontrada' : 'Algo salió mal'), robots: 'noindex' })
</script>

<template>
  <div class="relative isolate grid min-h-dvh place-items-center overflow-hidden px-4">
    <div class="pointer-events-none absolute inset-0 -z-10 bg-grid opacity-60 mask-fade-b" aria-hidden="true" />
    <main class="flex max-w-md flex-col items-center text-center">
      <SharedLogo />
      <p class="mt-10 text-display text-[120px] leading-none tracking-tight text-accent-ink tabular-nums">
        {{ error.statusCode }}
      </p>
      <h1 class="mt-2 text-2xl font-semibold tracking-tight">
        {{ is404 ? 'Esta página no existe' : 'Algo salió mal' }}
      </h1>
      <p class="mt-2 text-[15px] text-muted">
        {{ is404 ? 'Quizá el enlace cambió o se escribió mal. Tu próxima cita sigue a un clic.' : 'Ocurrió un error inesperado. Intenta de nuevo en un momento.' }}
      </p>
      <div class="mt-8 flex gap-2">
        <UiButton pill @click="clearError({ redirect: '/' })">
          Volver al inicio
        </UiButton>
        <UiButton variant="outline" pill @click="clearError({ redirect: '/reservar' })">
          Reservar cita
        </UiButton>
      </div>
    </main>
  </div>
</template>
