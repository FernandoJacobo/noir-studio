<script setup lang="ts">
import { TooltipContent, TooltipPortal, TooltipRoot, TooltipTrigger } from 'reka-ui'

withDefaults(defineProps<{
  content: string
  side?: 'top' | 'bottom' | 'left' | 'right'
  shortcut?: string
  disabled?: boolean
}>(), { side: 'top' })
</script>

<template>
  <TooltipRoot :disabled="disabled">
    <TooltipTrigger as-child>
      <slot />
    </TooltipTrigger>
    <TooltipPortal>
      <TooltipContent
        :side="side"
        :side-offset="6"
        class="z-50 flex items-center gap-2 rounded-[7px] border border-border bg-surface-2 px-2 py-1 text-xs font-medium text-foreground shadow-lg data-[state=delayed-open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=delayed-open]:fade-in-0 data-[state=delayed-open]:zoom-in-95"
      >
        {{ content }}
        <UiKbd v-if="shortcut">
          {{ shortcut }}
        </UiKbd>
      </TooltipContent>
    </TooltipPortal>
  </TooltipRoot>
</template>
