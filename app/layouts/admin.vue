<script setup lang="ts">
import { toast } from 'vue-sonner'

const ui = useUiStore()
const auth = useAuthStore()
const router = useRouter()
const { current } = useAdminNav()
const { modKey } = useShortcuts()
const { reset } = useDemo()

const route = useRoute()
watch(() => route.fullPath, () => (ui.mobileNavOpen = false))

/** Título de la página actual: permite que una página defina el suyo (p. ej. ficha de cliente). */
const pageTitle = computed(() => (route.meta.title as string | undefined) ?? current.value?.label)

const resetOpen = ref(false)
function doReset() {
  reset()
  toast.success('Demo restablecido', { description: 'Todos los datos volvieron a su estado inicial.' })
}

function openSite() {
  window.open('/', '_blank')
}

function logout() {
  auth.logout()
  router.push('/admin/login')
}
</script>

<template>
  <div class="flex min-h-dvh">
    <!-- Sidebar desktop -->
    <aside
      :class="cn(
        'sticky top-0 hidden h-dvh shrink-0 border-r border-border bg-surface/50 transition-[width] duration-300 ease-[var(--ease-out-soft)] lg:block',
        ui.sidebarCollapsed ? 'w-[60px]' : 'w-60',
      )"
    >
      <AdminSidebar :collapsed="ui.sidebarCollapsed" />
    </aside>

    <!-- Sidebar móvil -->
    <UiSheet v-model:open="ui.mobileNavOpen" side="left" title="Menú" class="p-0 [&>div:nth-child(2)]:p-0">
      <AdminSidebar @navigate="ui.mobileNavOpen = false" />
    </UiSheet>

    <div class="flex min-w-0 flex-1 flex-col">
      <header class="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background/80 px-3 backdrop-blur-xl sm:px-4">
        <UiButton variant="ghost" size="icon-sm" class="lg:hidden" aria-label="Abrir menú" @click="ui.mobileNavOpen = true">
          <Icon name="lucide:menu" class="size-[18px]" />
        </UiButton>
        <UiTooltip :content="ui.sidebarCollapsed ? 'Expandir menú' : 'Colapsar menú'" side="bottom">
          <UiButton variant="ghost" size="icon-sm" class="hidden lg:inline-flex" :aria-label="ui.sidebarCollapsed ? 'Expandir menú' : 'Colapsar menú'" @click="ui.sidebarCollapsed = !ui.sidebarCollapsed">
            <Icon name="lucide:panel-left" class="size-[18px]" />
          </UiButton>
        </UiTooltip>

        <nav aria-label="Ruta" class="min-w-0">
          <ol class="flex items-center gap-1.5 text-[13px]">
            <li class="hidden text-muted sm:block">
              <NuxtLink to="/admin" class="hover:text-foreground">
                Panel
              </NuxtLink>
            </li>
            <li class="hidden text-muted/50 sm:block" aria-hidden="true">
              /
            </li>
            <li v-if="current && pageTitle !== current.label" class="hidden text-muted sm:block">
              <NuxtLink :to="current.to" class="hover:text-foreground">
                {{ current.label }}
              </NuxtLink>
            </li>
            <li v-if="current && pageTitle !== current.label" class="hidden text-muted/50 sm:block" aria-hidden="true">
              /
            </li>
            <li class="truncate font-medium" aria-current="page">
              {{ pageTitle }}
            </li>
          </ol>
        </nav>

        <div class="ml-auto flex items-center gap-1.5">
          <button
            type="button"
            class="hidden h-8 w-56 items-center gap-2 rounded-[9px] border border-border bg-surface px-2.5 text-[13px] text-muted shadow-[inset_0_1px_0_var(--highlight)] transition-colors hover:border-border-strong md:flex"
            @click="ui.commandOpen = true"
          >
            <Icon name="lucide:search" class="size-3.5" />
            Buscar…
            <span class="ml-auto flex gap-0.5"><UiKbd>{{ modKey }}</UiKbd><UiKbd>K</UiKbd></span>
          </button>
          <UiButton variant="ghost" size="icon-sm" class="md:hidden" aria-label="Buscar" @click="ui.commandOpen = true">
            <Icon name="lucide:search" class="size-[18px]" />
          </UiButton>
          <UiTooltip content="Nueva cita" shortcut="N" side="bottom">
            <UiButton size="sm" class="px-2.5 sm:px-3" @click="ui.openNewAppointment()">
              <Icon name="lucide:plus" class="size-4" />
              <span class="hidden sm:inline">Nueva cita</span>
            </UiButton>
          </UiTooltip>
          <SharedThemeToggle />
          <UiDropdown>
            <template #trigger>
              <button type="button" class="ml-0.5 rounded-full" aria-label="Menú de usuario">
                <SharedAvatar name="Demo Admin" class="size-8 text-[10px]" />
              </button>
            </template>
            <div class="px-2 py-1.5">
              <p class="text-[13px] font-medium">
                Demo Admin
              </p>
              <p class="text-xs text-muted">
                {{ auth.user }} · entorno de demostración
              </p>
            </div>
            <UiDropdownSeparator />
            <UiDropdownItem icon="lucide:globe" @select="openSite">
              Ver sitio público
            </UiDropdownItem>
            <UiDropdownItem icon="lucide:settings" @select="router.push('/admin/configuracion')">
              Configuración
            </UiDropdownItem>
            <UiDropdownItem icon="lucide:rotate-ccw" @select="resetOpen = true">
              Restablecer demo
            </UiDropdownItem>
            <UiDropdownSeparator />
            <UiDropdownItem icon="lucide:log-out" danger @select="logout">
              Cerrar sesión
            </UiDropdownItem>
          </UiDropdown>
        </div>
      </header>

      <main id="contenido" class="min-w-0 flex-1">
        <slot />
      </main>
    </div>

    <AdminCommandPalette />
    <AdminNewAppointmentDialog />
    <UiConfirmDialog
      v-model:open="resetOpen"
      title="¿Restablecer el demo?"
      description="Se borrarán las citas, clientes y cambios que hayas hecho y se cargarán los datos semilla con fechas relativas a hoy."
      confirm-label="Restablecer"
      destructive
      @confirm="doReset"
    />
  </div>
</template>
