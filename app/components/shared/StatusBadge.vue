<script setup lang="ts">
import type { AppointmentStatus } from '~~/types'

const props = defineProps<{ status: AppointmentStatus }>()
const meta = computed(() => STATUS_META[props.status])
</script>

<template>
  <UiBadge :tone="meta.tone" dot>
    {{ meta.label }}
  </UiBadge>
</template>
