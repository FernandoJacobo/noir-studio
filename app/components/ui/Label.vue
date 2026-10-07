<script setup lang="ts">
import type { HTMLAttributes } from 'vue'

const props = defineProps<{ for?: string, class?: HTMLAttributes['class'], hint?: string }>()
</script>

<template>
  <label :for="props.for" :class="cn('flex items-baseline justify-between gap-2 text-[13px] font-medium text-foreground', props.class)">
    <span><slot /></span>
    <span v-if="hint" class="text-xs font-normal text-muted">{{ hint }}</span>
  </label>
</template>
