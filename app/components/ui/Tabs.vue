<script setup lang="ts" generic="T extends string">
import type { HTMLAttributes } from 'vue'
import { TabsIndicator, TabsList, TabsRoot, TabsTrigger } from 'reka-ui'

/**
 * Control segmentado con indicador animado (Reka Tabs).
 * El contenido se maneja fuera con `v-model`, así funciona también como selector de vista.
 */
const props = defineProps<{
  items: { value: T, label: string, icon?: string, count?: number }[]
  label?: string
  size?: 'sm' | 'md'
  class?: HTMLAttributes['class']
}>()

const model = defineModel<T>({ required: true })
</script>

<template>
  <TabsRoot v-model="model" :class="props.class" activation-mode="automatic">
    <TabsList
      :aria-label="label"
      class="relative inline-flex items-center gap-0.5 rounded-[11px] border border-border bg-surface-2/60 p-[3px]"
    >
      <TabsIndicator class="absolute left-0 top-[3px] h-[calc(100%-6px)] w-[var(--reka-tabs-indicator-size)] translate-x-[var(--reka-tabs-indicator-position)] rounded-[8px] border border-border bg-surface shadow-[inset_0_1px_0_var(--highlight),0_1px_2px_rgb(var(--shadow-color)/0.12)] transition-[width,transform] duration-250 ease-[var(--ease-out-soft)]" />
      <TabsTrigger
        v-for="item in items"
        :key="item.value"
        :value="item.value"
        :class="cn(
          'relative z-10 inline-flex items-center gap-1.5 whitespace-nowrap rounded-[8px] font-medium text-muted outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring data-[state=active]:text-foreground',
          size === 'sm' ? 'h-7 px-2.5 text-xs' : 'h-8 px-3 text-[13px]',
        )"
      >
        <Icon v-if="item.icon" :name="item.icon" class="size-3.5" />
        {{ item.label }}
        <span v-if="item.count !== undefined" class="tabular-nums text-[11px] text-muted">{{ item.count }}</span>
      </TabsTrigger>
    </TabsList>
  </TabsRoot>
</template>
