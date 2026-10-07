<script setup lang="ts">
import type { HTMLAttributes } from 'vue'

defineOptions({ inheritAttrs: false })

const props = defineProps<{
  class?: HTMLAttributes['class']
  icon?: string
}>()

const model = defineModel<string | number>()
const attrs = useAttrs()
const el = useTemplateRef<HTMLInputElement>('input')

defineExpose({ focus: () => el.value?.focus() })
</script>

<template>
  <div v-if="icon" :class="cn('relative', props.class)">
    <Icon :name="icon" class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
    <input ref="input" v-model="model" v-bind="attrs" :class="cn(inputClass, 'pl-9')">
  </div>
  <input v-else ref="input" v-model="model" v-bind="attrs" :class="cn(inputClass, props.class)">
</template>
