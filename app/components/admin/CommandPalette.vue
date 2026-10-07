<script setup lang="ts">
import { DialogContent, DialogDescription, DialogOverlay, DialogPortal, DialogRoot, DialogTitle, ListboxContent, ListboxFilter, ListboxGroup, ListboxGroupLabel, ListboxItem, ListboxRoot, VisuallyHidden } from 'reka-ui'

interface Command {
  id: string
  label: string
  hint?: string
  icon: string
  keywords?: string
  shortcut?: string
  run: () => void
}

const ui = useUiStore()
const router = useRouter()
const auth = useAuthStore()
const clients = useClientsStore()
const appointments = useAppointmentsStore()
const { items: navItems } = useAdminNav()
const { toggle, setPreference } = useTheme()
const query = ref('')

watch(() => ui.commandOpen, (open) => {
  if (open) query.value = ''
})

function go(path: string) {
  router.push(path)
}

const actions: Command[] = [
  { id: 'new', label: 'Nueva cita', icon: 'lucide:calendar-plus', shortcut: 'N', keywords: 'crear agendar reservar', run: () => ui.openNewAppointment() },
  { id: 'theme', label: 'Alternar tema claro / oscuro', icon: 'lucide:sun', keywords: 'dark light modo', run: () => toggle() },
  { id: 'theme-system', label: 'Usar tema del sistema', icon: 'lucide:monitor', keywords: 'auto', run: () => setPreference('system') },
  { id: 'site', label: 'Abrir sitio público', icon: 'lucide:globe', keywords: 'landing web', run: () => window.open('/', '_blank') },
  { id: 'book', label: 'Abrir flujo de reservación', icon: 'lucide:arrow-up-right', keywords: 'wizard reservar', run: () => window.open('/reservar', '_blank') },
  { id: 'logout', label: 'Cerrar sesión', icon: 'lucide:log-out', run: () => {
    auth.logout()
    router.push('/admin/login')
  } },
]

const navigation = computed<Command[]>(() => navItems.map(i => ({
  id: `nav-${i.to}`,
  label: `Ir a ${i.label}`,
  icon: i.icon,
  shortcut: `G ${i.key.toUpperCase()}`,
  run: () => go(i.to),
})))

const normalize = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
const matches = (c: { label: string, hint?: string, keywords?: string }) =>
  normalize(`${c.label} ${c.hint ?? ''} ${c.keywords ?? ''}`).includes(normalize(query.value.trim()))

const groups = computed(() => {
  const q = query.value.trim()
  const result: { label: string, items: Command[] }[] = [
    { label: 'Acciones', items: actions.filter(matches) },
    { label: 'Navegación', items: navigation.value.filter(matches) },
  ]
  if (q.length >= 2) {
    result.push({
      label: 'Clientes',
      items: clients.items
        .filter(c => matches({ label: c.name, hint: c.phone, keywords: c.email }))
        .slice(0, 5)
        .map(c => ({ id: `cli-${c.id}`, label: c.name, hint: formatPhone(c.phone), icon: 'lucide:user-round', run: () => go(`/admin/clientes/${c.id}`) })),
    })
    result.push({
      label: 'Citas',
      items: appointments.sorted
        .filter(a => matches({ label: a.folio, keywords: clients.get(a.clientId)?.name }))
        .slice(-5)
        .reverse()
        .map(a => ({
          id: `apt-${a.id}`,
          label: `${a.folio} · ${clients.get(a.clientId)?.name ?? ''}`,
          hint: `${formatDateShort(a.date)}, ${formatTime(a.start)}`,
          icon: 'lucide:calendar-days',
          run: () => router.push({ path: '/admin/agenda', query: { date: a.date, cita: a.id } }),
        })),
    })
  }
  return result.filter(g => g.items.length)
})

function run(cmd: Command) {
  ui.commandOpen = false
  nextTick(cmd.run)
}
</script>

<template>
  <DialogRoot v-model:open="ui.commandOpen">
    <DialogPortal>
      <DialogOverlay class="fixed inset-0 z-50 bg-black/50 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
      <DialogContent class="fixed left-1/2 top-[12vh] z-50 w-[calc(100vw-2rem)] max-w-xl -translate-x-1/2 overflow-hidden surface-elevated p-0 outline-none duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-[0.98] data-[state=open]:zoom-in-[0.98]">
        <VisuallyHidden>
          <DialogTitle>Paleta de comandos</DialogTitle>
          <DialogDescription>Busca acciones, secciones, clientes o citas por folio.</DialogDescription>
        </VisuallyHidden>
        <ListboxRoot highlight-on-hover class="flex flex-col">
          <div class="flex items-center gap-3 border-b border-border px-4">
            <Icon name="lucide:search" class="size-4 text-muted" />
            <ListboxFilter
              v-model="query"
              auto-focus
              placeholder="Busca acciones, clientes o folios…"
              class="h-12 flex-1 bg-transparent text-[14px] outline-none placeholder:text-muted/70"
            />
            <UiKbd>Esc</UiKbd>
          </div>
          <ListboxContent class="max-h-[min(60vh,420px)] overflow-y-auto p-2">
            <template v-if="groups.length">
              <ListboxGroup v-for="group in groups" :key="group.label" class="mb-1">
                <ListboxGroupLabel class="px-2 pb-1 pt-2 text-[11px] font-medium uppercase tracking-wider text-muted">
                  {{ group.label }}
                </ListboxGroupLabel>
                <ListboxItem
                  v-for="cmd in group.items"
                  :key="cmd.id"
                  :value="cmd.id"
                  class="flex h-10 cursor-default select-none items-center gap-3 rounded-[8px] px-2.5 text-[13px] outline-none data-[highlighted]:bg-surface-2"
                  @select="run(cmd)"
                >
                  <Icon :name="cmd.icon" class="size-4 text-muted" />
                  <span class="flex-1 truncate">{{ cmd.label }}</span>
                  <span v-if="cmd.hint" class="text-xs text-muted tabular-nums">{{ cmd.hint }}</span>
                  <span v-if="cmd.shortcut" class="flex gap-1">
                    <UiKbd v-for="k in cmd.shortcut.split(' ')" :key="k">{{ k }}</UiKbd>
                  </span>
                </ListboxItem>
              </ListboxGroup>
            </template>
            <SharedEmptyState v-else icon="lucide:search-x" title="Sin resultados" :description="`Nada coincide con “${query}”.`" class="py-8" />
          </ListboxContent>
          <div class="flex items-center gap-4 border-t border-border px-4 py-2 text-[11px] text-muted">
            <span class="flex items-center gap-1"><UiKbd>↑</UiKbd><UiKbd>↓</UiKbd> navegar</span>
            <span class="flex items-center gap-1"><UiKbd>↵</UiKbd> abrir</span>
            <span class="ml-auto">Escribe 2+ letras para buscar clientes y citas</span>
          </div>
        </ListboxRoot>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
