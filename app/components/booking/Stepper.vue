<script setup lang="ts">
const props = defineProps<{
  current: number
  canVisit: (i: number) => boolean
  completed: boolean[]
}>()
const emit = defineEmits<{ go: [number] }>()

const progress = computed(() => (props.current / (BOOKING_STEPS.length - 1)) * 100)
</script>

<template>
  <nav aria-label="Pasos de la reservación">
    <!-- Móvil: barra compacta -->
    <div class="sm:hidden">
      <div class="flex items-baseline justify-between text-xs">
        <span class="font-medium">{{ BOOKING_STEPS[current]?.label }}</span>
        <span class="tabular-nums text-muted">Paso {{ current + 1 }} de {{ BOOKING_STEPS.length }}</span>
      </div>
      <div class="mt-2 h-1 overflow-hidden rounded-full bg-surface-2" role="progressbar" :aria-valuenow="current + 1" aria-valuemin="1" :aria-valuemax="BOOKING_STEPS.length">
        <div class="h-full rounded-full bg-foreground transition-[width] duration-500 ease-[var(--ease-out-soft)]" :style="{ width: `${Math.max(progress, 6)}%` }" />
      </div>
    </div>

    <!-- Desktop: pasos con conectores -->
    <ol class="hidden items-center sm:flex">
      <li v-for="(step, i) in BOOKING_STEPS" :key="step.id" class="flex flex-1 items-center last:flex-none">
        <button
          type="button"
          :disabled="!canVisit(i) || i === current"
          :aria-current="i === current ? 'step' : undefined"
          :class="cn(
            'group flex items-center gap-2.5 rounded-full py-1 pl-1 pr-3 text-[13px] font-medium transition-colors',
            i === current ? 'text-foreground' : canVisit(i) ? 'text-muted hover:text-foreground' : 'text-muted/60',
            'disabled:cursor-default',
          )"
          @click="emit('go', i)"
        >
          <span
            :class="cn(
              'grid size-7 place-items-center rounded-full border text-xs tabular-nums transition-all duration-300',
              i === current && 'border-foreground bg-foreground text-background',
              i !== current && completed[i] && i < current && 'border-accent/40 bg-accent/15 text-accent-ink',
              i !== current && !(completed[i] && i < current) && 'border-border bg-surface',
            )"
          >
            <Icon v-if="completed[i] && i < current" name="lucide:check" class="size-3.5" />
            <template v-else>{{ i + 1 }}</template>
          </span>
          <span class="whitespace-nowrap">{{ step.label }}</span>
        </button>
        <span v-if="i < BOOKING_STEPS.length - 1" class="mx-2 h-px flex-1 overflow-hidden bg-border" aria-hidden="true">
          <span class="block h-full bg-accent/60 transition-transform duration-500 ease-[var(--ease-out-soft)]" :style="{ transform: `scaleX(${i < current ? 1 : 0})`, transformOrigin: 'left' }" />
        </span>
      </li>
    </ol>
  </nav>
</template>
