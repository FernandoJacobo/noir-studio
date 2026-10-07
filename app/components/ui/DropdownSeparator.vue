<script setup lang="ts">
import { DropdownMenuLabel, DropdownMenuSeparator } from 'reka-ui'

defineProps<{ label?: string }>()
</script>

<template>
  <DropdownMenuSeparator class="-mx-1 my-1 h-px bg-border" />
  <DropdownMenuLabel v-if="label" class="px-2 pb-1 pt-1.5 text-[11px] font-medium uppercase tracking-wider text-muted">
    {{ label }}
  </DropdownMenuLabel>
</template>
