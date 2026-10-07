<script setup lang="ts">
import type { Slot } from '~~/types'

const props = defineProps<{
  slots: Slot[]
  selected: number | null
  loading?: boolean
}>()
const emit = defineEmits<{ select: [Slot] }>()

const groups = computed(() => groupSlotsByPeriod(props.slots).filter(g => g.slots.length))
const periodIcon = { morning: 'lucide:sunrise', afternoon: 'lucide:sun', evening: 'lucide:moon' } as const

/** Navegación con flechas dentro del radiogroup. */
function onKeydown(e: KeyboardEvent) {
  if (!['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp'].includes(e.key)) return
  const buttons = [...(e.currentTarget as HTMLElement).querySelectorAll<HTMLButtonElement>('button[role=radio]')]
  const index = buttons.indexOf(document.activeElement as HTMLButtonElement)
  if (index === -1) return
  e.preventDefault()
  const step = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : -1
  buttons[(index + step + buttons.length) % buttons.length]?.focus()
}
</script>

<template>
  <div>
    <div v-if="loading" class="space-y-5" aria-busy="true" aria-label="Cargando horarios">
      <div v-for="g in 2" :key="g">
        <UiSkeleton class="mb-2.5 h-3.5 w-20" />
        <div class="grid grid-cols-3 gap-2 sm:grid-cols-4">
          <UiSkeleton v-for="n in 8" :key="n" class="h-10 rounded-[10px]" />
        </div>
      </div>
    </div>

    <SharedEmptyState
      v-else-if="!slots.length"
      icon="lucide:calendar-x"
      title="Sin horarios para este día"
      description="Prueba con otra fecha o con otro profesional."
      class="rounded-[12px] border border-dashed border-border py-10"
    />

    <div v-else role="radiogroup" aria-label="Horarios disponibles" class="space-y-5" @keydown="onKeydown">
      <section v-for="group in groups" :key="group.period">
        <h3 class="mb-2.5 flex items-center gap-1.5 text-xs font-medium text-muted">
          <Icon :name="periodIcon[group.period]" class="size-3.5" />
          {{ group.label }}
          <span class="tabular-nums text-muted/70">· {{ group.slots.length }}</span>
        </h3>
        <div class="stagger grid grid-cols-3 gap-2 sm:grid-cols-4">
          <button
            v-for="(slot, i) in group.slots"
            :key="slot.start"
            type="button"
            role="radio"
            :aria-checked="selected === slot.start"
            :tabindex="selected === slot.start || (selected === null && i === 0 && group === groups[0]) ? 0 : -1"
            :style="{ '--i': Math.min(i, 12) }"
            :class="cn(
              'h-10 rounded-[10px] border text-[13px] font-medium tabular-nums transition-all duration-150 active:scale-95',
              selected === slot.start
                ? 'border-foreground bg-foreground text-background shadow-md'
                : 'border-border bg-surface hover:border-border-strong hover:bg-surface-2',
            )"
            @click="emit('select', slot)"
          >
            {{ formatTime(slot.start) }}
          </button>
        </div>
      </section>
    </div>
  </div>
</template>
