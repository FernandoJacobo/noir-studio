<script setup lang="ts">
const { colorMode, setPreference } = useTheme()

const options = [
  { value: 'light', label: 'Claro', icon: 'lucide:sun' },
  { value: 'dark', label: 'Oscuro', icon: 'lucide:moon' },
  { value: 'system', label: 'Sistema', icon: 'lucide:monitor' },
] as const
</script>

<template>
  <div role="radiogroup" aria-label="Tema" class="inline-flex items-center gap-0.5 rounded-full border border-border bg-surface-2/50 p-0.5">
    <button
      v-for="opt in options"
      :key="opt.value"
      type="button"
      role="radio"
      :aria-checked="colorMode.preference === opt.value"
      :aria-label="opt.label"
      :title="opt.label"
      :class="cn(
        'grid size-7 place-items-center rounded-full transition-colors',
        colorMode.preference === opt.value ? 'bg-surface text-foreground shadow-sm ring-1 ring-border' : 'text-muted hover:text-foreground',
      )"
      @click="setPreference(opt.value, { x: $event.clientX, y: $event.clientY })"
    >
      <Icon :name="opt.icon" class="size-3.5" />
    </button>
  </div>
</template>
