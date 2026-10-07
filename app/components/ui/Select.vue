<script setup lang="ts" generic="T extends string | number">
import type { HTMLAttributes } from 'vue'
import { SelectContent, SelectIcon, SelectItem, SelectItemIndicator, SelectItemText, SelectPortal, SelectRoot, SelectTrigger, SelectValue, SelectViewport } from 'reka-ui'

const props = defineProps<{
  options: { value: T, label: string, icon?: string, hint?: string }[]
  placeholder?: string
  id?: string
  label?: string
  disabled?: boolean
  class?: HTMLAttributes['class']
}>()

const model = defineModel<T>()
const selected = computed(() => props.options.find(o => o.value === model.value))
</script>

<template>
  <SelectRoot v-model="model as any" :disabled="disabled">
    <SelectTrigger
      :id="id"
      :aria-label="label"
      :class="cn(inputClass, 'items-center justify-between gap-2 text-left data-[placeholder]:text-muted [&>span]:truncate', props.class)"
    >
      <span class="flex min-w-0 items-center gap-2">
        <Icon v-if="selected?.icon" :name="selected.icon" class="size-4 shrink-0 text-muted" />
        <SelectValue :placeholder="placeholder ?? 'Seleccionar'">{{ selected?.label }}</SelectValue>
      </span>
      <SelectIcon as-child>
        <Icon name="lucide:chevrons-up-down" class="size-3.5 shrink-0 text-muted" />
      </SelectIcon>
    </SelectTrigger>
    <SelectPortal>
      <SelectContent position="popper" :side-offset="6" :collision-padding="12" :class="cn(floatingClass, 'max-h-72 min-w-[var(--reka-select-trigger-width)] overflow-hidden')">
        <SelectViewport class="p-0">
          <SelectItem
            v-for="opt in options"
            :key="String(opt.value)"
            :value="opt.value"
            class="relative flex h-8 cursor-pointer select-none items-center gap-2 rounded-[7px] pl-2 pr-8 text-[13px] outline-none data-[disabled]:opacity-40 data-[highlighted]:bg-surface-2"
          >
            <Icon v-if="opt.icon" :name="opt.icon" class="size-4 text-muted" />
            <SelectItemText>{{ opt.label }}</SelectItemText>
            <span v-if="opt.hint" class="ml-auto text-[11px] text-muted">{{ opt.hint }}</span>
            <SelectItemIndicator class="absolute right-2 inline-flex">
              <Icon name="lucide:check" class="size-3.5" />
            </SelectItemIndicator>
          </SelectItem>
        </SelectViewport>
      </SelectContent>
    </SelectPortal>
  </SelectRoot>
</template>
