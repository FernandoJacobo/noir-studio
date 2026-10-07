<script setup lang="ts">
const props = defineProps<{
  label: string
  value: string
  icon: string
  /** Variación porcentual vs. periodo anterior (o puntos, si `unit` = 'pts'). */
  delta: number | null
  unit?: '%' | 'pts'
  caption: string
}>()

const tone = computed(() => (props.delta === null || props.delta === 0 ? 'neutral' : props.delta > 0 ? 'up' : 'down'))
</script>

<template>
  <div class="surface-card flex flex-col p-4 sm:p-5">
    <div class="flex items-center justify-between gap-2">
      <p class="text-[13px] text-muted">
        {{ label }}
      </p>
      <span class="grid size-7 place-items-center rounded-[8px] border border-border bg-surface-2/60">
        <Icon :name="icon" class="size-3.5 text-muted" />
      </span>
    </div>
    <p class="mt-3 text-[28px] font-semibold leading-none tracking-[-0.03em] tabular-nums">
      {{ value }}
    </p>
    <p class="mt-3 flex items-center gap-1.5 text-xs text-muted">
      <span
        v-if="delta !== null"
        :class="cn(
          'inline-flex items-center gap-0.5 rounded-full px-1.5 py-px font-medium tabular-nums',
          tone === 'up' && 'bg-success/12 text-success',
          tone === 'down' && 'bg-danger/12 text-danger',
          tone === 'neutral' && 'bg-surface-2 text-muted',
        )"
      >
        <Icon v-if="tone !== 'neutral'" :name="tone === 'up' ? 'lucide:trending-up' : 'lucide:trending-down'" class="size-3" />
        <span class="sr-only">{{ tone === 'up' ? 'Sube' : tone === 'down' ? 'Baja' : 'Sin cambio' }}</span>
        {{ delta > 0 ? '+' : '' }}{{ delta }}{{ unit === 'pts' ? ' pts' : '%' }}
      </span>
      <span v-else class="rounded-full bg-surface-2 px-1.5 py-px font-medium">nuevo</span>
      {{ caption }}
    </p>
  </div>
</template>
