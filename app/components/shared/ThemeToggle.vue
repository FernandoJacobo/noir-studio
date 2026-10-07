<script setup lang="ts">
const { isDark, toggle } = useTheme()
const label = computed(() => (isDark.value ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'))
</script>

<template>
  <UiTooltip :content="label">
    <button
      type="button"
      :aria-label="label"
      class="relative grid size-9 place-items-center overflow-hidden rounded-[10px] text-muted transition-colors hover:bg-surface-2 hover:text-foreground"
      @click="toggle"
    >
      <!-- Sol -->
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.75"
        stroke-linecap="round"
        :class="cn('absolute size-[18px] transition-all duration-500 ease-[var(--ease-out-soft)]', isDark ? 'rotate-90 scale-50 opacity-0' : 'rotate-0 scale-100 opacity-100')"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
      </svg>
      <!-- Luna -->
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.75"
        stroke-linecap="round"
        stroke-linejoin="round"
        :class="cn('absolute size-[18px] transition-all duration-500 ease-[var(--ease-out-soft)]', isDark ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-50 opacity-0')"
        aria-hidden="true"
      >
        <path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401" />
      </svg>
    </button>
  </UiTooltip>
</template>
