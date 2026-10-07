<script setup lang="ts">
import type { HTMLAttributes } from 'vue'

const props = defineProps<{
  tone?: BadgeVariants['tone']
  dot?: boolean
  class?: HTMLAttributes['class']
}>()
</script>

<template>
  <span :class="cn(badgeVariants({ tone }), props.class)">
    <span v-if="dot" class="size-1.5 rounded-full bg-current" aria-hidden="true" />
    <slot />
  </span>
</template>
