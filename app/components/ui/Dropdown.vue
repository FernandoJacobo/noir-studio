<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { DropdownMenuContent, DropdownMenuPortal, DropdownMenuRoot, DropdownMenuTrigger } from 'reka-ui'

const props = withDefaults(defineProps<{
  align?: 'start' | 'center' | 'end'
  class?: HTMLAttributes['class']
}>(), { align: 'end' })
</script>

<template>
  <DropdownMenuRoot :modal="false">
    <DropdownMenuTrigger as-child>
      <slot name="trigger" />
    </DropdownMenuTrigger>
    <DropdownMenuPortal>
      <DropdownMenuContent :align="align" :side-offset="6" :collision-padding="12" :class="cn(floatingClass, 'min-w-48', props.class)">
        <slot />
      </DropdownMenuContent>
    </DropdownMenuPortal>
  </DropdownMenuRoot>
</template>
