<script setup lang="ts">
import { SwitchRoot, SwitchThumb } from 'reka-ui'

defineProps<{ id?: string, disabled?: boolean, label?: string }>()
const model = defineModel<boolean>({ default: false })
</script>

<template>
  <SwitchRoot
    :id="id"
    v-model="model"
    :disabled="disabled"
    :aria-label="label"
    class="inline-flex h-[22px] w-[38px] shrink-0 cursor-pointer items-center rounded-full border border-border bg-surface-2 p-[2px] transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-transparent data-[state=checked]:bg-primary"
  >
    <SwitchThumb class="pointer-events-none block size-4 rounded-full bg-muted shadow-sm transition-transform duration-200 ease-out data-[state=checked]:translate-x-4 data-[state=checked]:bg-primary-foreground" />
  </SwitchRoot>
</template>
