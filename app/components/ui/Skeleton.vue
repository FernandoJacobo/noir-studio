<script setup lang="ts">
import type { HTMLAttributes } from 'vue'

const props = defineProps<{ class?: HTMLAttributes['class'] }>()
</script>

<template>
  <div aria-hidden="true" :class="cn('skeleton rounded-[8px]', props.class)" />
</template>
