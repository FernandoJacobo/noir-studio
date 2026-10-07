<script setup lang="ts">
/** Calificación con estrellas rellenas (SVG propio: los iconos Lucide son solo contorno). */
defineProps<{ rating: number, size?: string }>()
</script>

<template>
  <span class="inline-flex gap-0.5 text-accent" role="img" :aria-label="`${rating} de 5 estrellas`">
    <svg v-for="n in 5" :key="n" viewBox="0 0 24 24" :class="cn(size ?? 'size-3.5', n > Math.round(rating) && 'opacity-25')" aria-hidden="true">
      <path fill="currentColor" d="M12 2.5l2.94 5.96 6.56.95-4.75 4.63 1.12 6.54L12 17.5l-5.87 3.08 1.12-6.54L2.5 9.41l6.56-.95z" />
    </svg>
  </span>
</template>
