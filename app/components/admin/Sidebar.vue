<script setup lang="ts">
defineProps<{ collapsed?: boolean }>()
const emit = defineEmits<{ navigate: [] }>()

const { items, current } = useAdminNav()
const appointments = useAppointmentsStore()
const now = useNowTicker()
const { brand } = useAppConfig()

/** Contador de pendientes para la sección Citas. */
const pending = computed(() => {
  const today = toISODate(now.value)
  return appointments.items.filter(a => a.status === 'pending' && a.date >= today).length
})
</script>

<template>
  <nav class="flex h-full flex-col" aria-label="Panel">
    <div :class="cn('flex h-14 shrink-0 items-center border-b border-border', collapsed ? 'justify-center px-2' : 'px-4')">
      <NuxtLink to="/admin" class="rounded-lg" :aria-label="`${brand.name} — Dashboard`" @click="emit('navigate')">
        <SharedLogo :compact="collapsed" size="sm" />
      </NuxtLink>
    </div>

    <ul class="flex-1 space-y-0.5 overflow-y-auto p-2">
      <li v-for="item in items" :key="item.to">
        <UiTooltip :content="item.label" side="right" :shortcut="`G ${item.key.toUpperCase()}`" :disabled="!collapsed">
          <NuxtLink
            :to="item.to"
            :aria-current="current?.to === item.to ? 'page' : undefined"
            :class="cn(
              'group relative flex h-9 items-center gap-3 rounded-[9px] text-[13px] font-medium transition-colors',
              collapsed ? 'justify-center px-0' : 'px-2.5',
              current?.to === item.to ? 'bg-surface-2 text-foreground shadow-[inset_0_1px_0_var(--highlight)]' : 'text-muted hover:bg-surface-2/60 hover:text-foreground',
            )"
            @click="emit('navigate')"
          >
            <span v-if="current?.to === item.to" class="absolute -left-2 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-r-full bg-accent" aria-hidden="true" />
            <Icon :name="item.icon" class="size-[18px]" />
            <span v-if="!collapsed" class="flex-1">{{ item.label }}</span>
            <span
              v-if="item.to === '/admin/citas' && pending"
              :class="cn('rounded-full bg-accent px-1.5 text-[10px] font-semibold leading-4 tabular-nums text-accent-foreground', collapsed && 'absolute right-1 top-1 px-1')"
              :aria-label="`${pending} pendientes`"
            >{{ pending }}</span>
          </NuxtLink>
        </UiTooltip>
      </li>
    </ul>

    <div :class="cn('shrink-0 border-t border-border p-2', collapsed && 'flex justify-center')">
      <UiTooltip content="Ver sitio público" side="right" :disabled="!collapsed">
        <NuxtLink to="/" target="_blank" :class="cn('flex h-9 items-center gap-3 rounded-[9px] text-[13px] text-muted hover:bg-surface-2/60 hover:text-foreground', collapsed ? 'w-9 justify-center' : 'px-2.5')">
          <Icon name="lucide:globe" class="size-[18px]" />
          <span v-if="!collapsed">Ver sitio público</span>
          <Icon v-if="!collapsed" name="lucide:arrow-up-right" class="ml-auto size-3.5" />
        </NuxtLink>
      </UiTooltip>
    </div>
  </nav>
</template>
