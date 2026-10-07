<script setup lang="ts">
import type { HTMLAttributes } from 'vue'

const props = defineProps<{
  name: string
  src?: string
  class?: HTMLAttributes['class']
  ring?: boolean
}>()

const failed = ref(false)
watch(() => props.src, () => (failed.value = false))

/** Tono estable por nombre para las iniciales (variaciones sutiles del gris). */
const hue = computed(() => [...props.name].reduce((s, c) => s + c.charCodeAt(0), 0) % 4)
const tones = ['bg-surface-2', 'bg-[color-mix(in_oklab,var(--accent)_18%,var(--surface-2))]', 'bg-[color-mix(in_oklab,var(--info)_14%,var(--surface-2))]', 'bg-[color-mix(in_oklab,var(--success)_12%,var(--surface-2))]']
</script>

<template>
  <span
    :class="cn(
      'relative inline-grid size-9 shrink-0 place-items-center overflow-hidden rounded-full border border-border text-[11px] font-semibold tracking-wide text-foreground',
      tones[hue],
      ring && 'ring-2 ring-background',
      props.class,
    )"
  >
    <img
      v-if="src && !failed"
      :src="src"
      :alt="name"
      loading="lazy"
      decoding="async"
      class="size-full object-cover"
      @error="failed = true"
    >
    <span v-else aria-hidden="true">{{ initials(name) }}</span>
  </span>
</template>
