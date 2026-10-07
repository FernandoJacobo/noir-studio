<script setup lang="ts">
import { DropdownMenuItem } from 'reka-ui'

defineProps<{ icon?: string, danger?: boolean, shortcut?: string, disabled?: boolean }>()
const emit = defineEmits<{ select: [Event] }>()
</script>

<template>
  <DropdownMenuItem
    :disabled="disabled"
    :class="cn(
      'flex h-8 cursor-default select-none items-center gap-2.5 rounded-[7px] px-2 text-[13px] outline-none transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-40 data-[highlighted]:bg-surface-2',
      danger ? 'text-danger' : 'text-foreground',
    )"
    @select="emit('select', $event)"
  >
    <Icon v-if="icon" :name="icon" :class="cn('size-4', danger ? 'text-danger' : 'text-muted')" />
    <span class="flex-1">
      <slot />
    </span>
    <span v-if="shortcut" class="text-[11px] text-muted">{{ shortcut }}</span>
  </DropdownMenuItem>
</template>
