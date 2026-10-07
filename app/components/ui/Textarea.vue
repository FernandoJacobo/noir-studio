<script setup lang="ts">
import type { HTMLAttributes } from 'vue'

const props = defineProps<{ class?: HTMLAttributes['class'] }>()
const model = defineModel<string>()
</script>

<template>
  <textarea v-model="model" :class="cn(inputClass, 'h-auto min-h-20 resize-y py-2.5 leading-relaxed', props.class)" />
</template>
