<script setup lang="ts">
import type { HTMLAttributes } from 'vue'

const props = withDefaults(defineProps<{
  icon?: string
  title: string
  description?: string
  class?: HTMLAttributes['class']
}>(), { icon: 'lucide:inbox' })
</script>

<template>
  <div :class="cn('flex flex-col items-center justify-center px-6 py-12 text-center', props.class)">
    <div class="relative mb-4">
      <div class="absolute -inset-6 rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--accent)_14%,transparent),transparent_70%)]" aria-hidden="true" />
      <div class="relative grid size-12 place-items-center rounded-[14px] border border-border bg-surface shadow-[inset_0_1px_0_var(--highlight)]">
        <Icon :name="icon" class="size-5 text-muted" />
      </div>
    </div>
    <p class="text-[15px] font-medium tracking-tight">
      {{ title }}
    </p>
    <p v-if="description" class="mt-1 max-w-sm text-[13px] leading-relaxed text-muted">
      {{ description }}
    </p>
    <div v-if="$slots.default" class="mt-5">
      <slot />
    </div>
  </div>
</template>
