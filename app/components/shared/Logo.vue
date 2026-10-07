<script setup lang="ts">
/**
 * Wordmark geométrico. El monograma es un cuadrado partido en diagonal
 * con un círculo: tijera abstracta / reloj (estilo + hora). El texto sale de `app.config.ts`.
 */
withDefaults(defineProps<{ compact?: boolean, size?: 'sm' | 'md' | 'lg' }>(), { size: 'md' })
const { brand } = useAppConfig()
</script>

<template>
  <span :class="cn('inline-flex select-none items-center text-foreground', size === 'lg' ? 'gap-3' : 'gap-2.5')">
    <svg
      viewBox="0 0 32 32"
      :class="size === 'lg' ? 'size-9' : size === 'sm' ? 'size-6' : 'size-7'"
      aria-hidden="true"
    >
      <rect x="1" y="1" width="30" height="30" rx="8" fill="currentColor" />
      <path d="M9 23 L23 9" stroke="var(--background)" stroke-width="2.2" stroke-linecap="round" />
      <circle cx="20.5" cy="20.5" r="3.2" fill="none" stroke="var(--accent)" stroke-width="2" />
      <circle cx="11.5" cy="11.5" r="1.7" fill="var(--background)" />
    </svg>
    <span v-if="!compact" class="flex items-baseline gap-1.5 leading-none">
      <span :class="cn('font-semibold tracking-[0.22em]', size === 'lg' ? 'text-xl' : size === 'sm' ? 'text-[13px]' : 'text-[15px]')">{{ brand.wordmark }}</span>
      <span v-if="brand.wordmarkSuffix" :class="cn('text-display text-muted', size === 'lg' ? 'text-xl' : size === 'sm' ? 'text-sm' : 'text-base')">{{ brand.wordmarkSuffix }}</span>
    </span>
    <span class="sr-only">{{ brand.name }}</span>
  </span>
</template>
