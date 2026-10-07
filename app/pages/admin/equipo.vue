<script setup lang="ts">
import { toast } from 'vue-sonner'
import type { StaffMember, WeeklySchedule } from '~~/types'

definePageMeta({ layout: 'admin', middleware: 'admin' })
const { terms } = useAppConfig()
useSeoMeta({ title: terms.team, robots: 'noindex' })

const staff = useStaffStore()
const services = useServicesStore()
const settings = useSettingsStore()
const appointments = useAppointmentsStore()
const now = useNowTicker()

type Draft = Omit<StaffMember, 'id'>
const emptySchedule = (): WeeklySchedule => {
  const hours = settings.settings.hours
  return Object.fromEntries(([0, 1, 2, 3, 4, 5, 6] as const).map(d => [d, hours[d]?.map(r => ({ ...r })) ?? null])) as WeeklySchedule
}
const emptyDraft = (): Draft => ({ name: '', role: '', bio: '', photo: '', specialties: [], serviceIds: services.items.map(s => s.id), schedule: emptySchedule(), daysOff: [], active: true })

const formOpen = ref(false)
const editing = ref<string | null>(null)
const draft = ref<Draft>(emptyDraft())
const tab = ref<'profile' | 'schedule'>('profile')
const specialtiesText = ref('')
const newDayOff = ref('')
const submitted = ref(false)

function openCreate() {
  editing.value = null
  draft.value = emptyDraft()
  specialtiesText.value = ''
  tab.value = 'profile'
  submitted.value = false
  formOpen.value = true
}

function openEdit(m: StaffMember, initialTab: 'profile' | 'schedule' = 'profile') {
  editing.value = m.id
  draft.value = JSON.parse(JSON.stringify({ ...m, photo: m.photo ?? '' }))
  specialtiesText.value = m.specialties.join(', ')
  tab.value = initialTab
  submitted.value = false
  formOpen.value = true
}

const nameError = computed(() => (draft.value.name.trim().length < 3 ? 'Escribe el nombre completo' : ''))
const servicesError = computed(() => (!draft.value.serviceIds.length ? 'Elige al menos un servicio' : ''))

function save() {
  submitted.value = true
  if (nameError.value || servicesError.value) {
    tab.value = 'profile'
    return
  }
  const data: Draft = {
    ...draft.value,
    name: draft.value.name.trim(),
    role: draft.value.role.trim() || capitalize(terms.professional),
    photo: draft.value.photo?.trim() || undefined,
    specialties: specialtiesText.value.split(',').map(s => s.trim()).filter(Boolean),
    daysOff: [...draft.value.daysOff].sort(),
  }
  if (editing.value) staff.update(editing.value, data)
  else staff.create(data)
  toast.success(editing.value ? 'Cambios guardados' : `${data.name} se unió al equipo`)
  formOpen.value = false
}

function toggleService(id: string) {
  const ids = draft.value.serviceIds
  draft.value.serviceIds = ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id]
}

function addDayOff() {
  if (newDayOff.value && !draft.value.daysOff.includes(newDayOff.value)) draft.value.daysOff.push(newDayOff.value)
  newDayOff.value = ''
}

const toDelete = ref<StaffMember | null>(null)
const deleteOpen = computed({ get: () => !!toDelete.value, set: v => !v && (toDelete.value = null) })
const upcomingOf = (id: string) => appointments.items.filter(a => a.staffId === id && a.date >= toISODate(now.value) && (a.status === 'pending' || a.status === 'confirmed')).length

function remove() {
  if (!toDelete.value) return
  const m = toDelete.value
  staff.remove(m.id)
  toast(`${m.name} eliminado del equipo`, { action: { label: 'Deshacer', onClick: () => staff.items.push(m) } })
}

/** Resumen corto del horario: "Mar–Sáb · 10:00 a. m. – 8:00 p. m." */
function scheduleSummary(m: StaffMember) {
  const days = WEEK_ORDER.filter(d => m.schedule[d]?.length)
  if (!days.length) return 'Sin horario'
  const hours = days.flatMap(d => m.schedule[d]!)
  const start = Math.min(...hours.map(r => r.start))
  const end = Math.max(...hours.map(r => r.end))
  return `${days.map(d => WEEKDAY_SHORT[d]).join(' · ')} — ${formatTime(start, { compact: true })} a ${formatTime(end, { compact: true })}`
}
</script>

<template>
  <div class="mx-auto max-w-7xl space-y-4 p-4 sm:p-6 lg:p-8">
    <header class="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 class="text-2xl font-semibold tracking-tight">
          {{ terms.team }}
        </h1>
        <p class="mt-1 text-[13px] text-muted">
          {{ pluralize(staff.active.length, terms.professional, terms.professionals) }} activos
        </p>
      </div>
      <UiButton size="sm" @click="openCreate">
        <Icon name="lucide:user-plus" class="size-4" />
        Agregar {{ terms.professional }}
      </UiButton>
    </header>

    <TransitionGroup tag="ul" name="list" class="grid gap-3 md:grid-cols-2">
      <li v-for="m in staff.items" :key="m.id" :class="cn('surface-card p-5 transition-opacity', !m.active && 'opacity-60')">
        <div class="flex items-start gap-4">
          <SharedAvatar :name="m.name" :src="m.photo" class="size-14" />
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2">
              <p class="truncate text-[15px] font-semibold tracking-tight">
                {{ m.name }}
              </p>
              <UiBadge v-if="!m.active" tone="muted">
                Inactivo
              </UiBadge>
            </div>
            <p class="text-[13px] text-muted">
              {{ m.role }}
            </p>
            <p class="mt-2 flex items-center gap-1.5 text-xs text-muted">
              <Icon name="lucide:clock" class="size-3.5" />
              {{ scheduleSummary(m) }}
            </p>
          </div>
          <UiDropdown>
            <template #trigger>
              <UiButton variant="ghost" size="icon-sm" :aria-label="`Acciones para ${m.name}`">
                <Icon name="lucide:ellipsis" class="size-4" />
              </UiButton>
            </template>
            <UiDropdownItem icon="lucide:pencil" @select="openEdit(m)">
              Editar perfil
            </UiDropdownItem>
            <UiDropdownItem icon="lucide:calendar-cog" @select="openEdit(m, 'schedule')">
              Horario y días libres
            </UiDropdownItem>
            <UiDropdownItem :icon="m.active ? 'lucide:eye-off' : 'lucide:eye'" @select="staff.update(m.id, { active: !m.active })">
              {{ m.active ? 'Desactivar' : 'Activar' }}
            </UiDropdownItem>
            <UiDropdownSeparator />
            <UiDropdownItem icon="lucide:trash-2" danger @select="toDelete = m">
              Eliminar
            </UiDropdownItem>
          </UiDropdown>
        </div>

        <!-- Mini mapa semanal -->
        <div class="mt-4 grid grid-cols-7 gap-1" aria-hidden="true">
          <div v-for="d in WEEK_ORDER" :key="d" class="text-center">
            <div :class="cn('h-1.5 rounded-full', m.schedule[d]?.length ? (m.schedule[d]!.length > 1 ? 'bg-[linear-gradient(90deg,var(--foreground)_45%,transparent_45%_55%,var(--foreground)_55%)] opacity-70' : 'bg-foreground/70') : 'bg-surface-2')" />
            <span class="mt-1 block text-[10px] text-muted">{{ WEEKDAY_SHORT[d] }}</span>
          </div>
        </div>

        <div class="mt-4 flex flex-wrap gap-1.5 border-t border-border pt-4">
          <UiBadge v-for="id in m.serviceIds.slice(0, 4)" :key="id">
            {{ services.get(id)?.name }}
          </UiBadge>
          <UiBadge v-if="m.serviceIds.length > 4" tone="muted">
            +{{ m.serviceIds.length - 4 }}
          </UiBadge>
        </div>
        <p v-if="m.daysOff.some(d => d >= toISODate(now))" class="mt-3 flex items-center gap-1.5 text-xs text-warning">
          <Icon name="lucide:plane" class="size-3.5" />
          Días libres: {{ m.daysOff.filter(d => d >= toISODate(now)).map(formatDateShort).join(', ') }}
        </p>
      </li>
    </TransitionGroup>

    <UiDialog v-model:open="formOpen" :title="editing ? `Editar a ${draft.name || terms.professional}` : `Nuevo ${terms.professional}`" size="xl">
      <UiTabs v-model="tab" class="mb-5" label="Secciones" :items="[{ value: 'profile', label: 'Perfil y servicios', icon: 'lucide:user-round' }, { value: 'schedule', label: 'Horario y días libres', icon: 'lucide:calendar-days' }]" />

      <form id="staff-form" novalidate @submit.prevent="save">
        <div v-show="tab === 'profile'" class="grid gap-4 sm:grid-cols-2">
          <div class="space-y-1.5">
            <UiLabel for="m-name">
              Nombre
            </UiLabel>
            <UiInput id="m-name" v-model="draft.name" :aria-invalid="submitted && !!nameError" />
            <p v-if="submitted && nameError" class="text-xs text-danger">
              {{ nameError }}
            </p>
          </div>
          <div class="space-y-1.5">
            <UiLabel for="m-role">
              Rol
            </UiLabel>
            <UiInput id="m-role" v-model="draft.role" placeholder="Ej. Barbero senior" />
          </div>
          <div class="space-y-1.5 sm:col-span-2">
            <UiLabel for="m-bio">
              Biografía
            </UiLabel>
            <UiTextarea id="m-bio" v-model="draft.bio" rows="2" />
          </div>
          <div class="space-y-1.5">
            <UiLabel for="m-spec" hint="Separadas por comas">
              Especialidades
            </UiLabel>
            <UiInput id="m-spec" v-model="specialtiesText" placeholder="Fade, Barba, Diseños" />
          </div>
          <div class="space-y-1.5">
            <UiLabel for="m-photo" hint="Opcional">
              Foto (URL)
            </UiLabel>
            <div class="flex gap-2">
              <SharedAvatar :name="draft.name || '?'" :src="draft.photo || undefined" class="size-10" />
              <UiInput id="m-photo" v-model="draft.photo" type="url" placeholder="https://…" />
            </div>
          </div>
          <fieldset class="sm:col-span-2">
            <legend class="mb-2 text-[13px] font-medium">
              Servicios que realiza
            </legend>
            <div class="flex flex-wrap gap-1.5">
              <button
                v-for="s in services.items"
                :key="s.id"
                type="button"
                :aria-pressed="draft.serviceIds.includes(s.id)"
                :class="cn(
                  'inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-xs font-medium transition-colors',
                  draft.serviceIds.includes(s.id) ? 'border-foreground bg-foreground text-background' : 'border-border text-muted hover:border-border-strong hover:text-foreground',
                )"
                @click="toggleService(s.id)"
              >
                <Icon v-if="draft.serviceIds.includes(s.id)" name="lucide:check" class="size-3" />
                {{ s.name }}
              </button>
            </div>
            <p v-if="submitted && servicesError" class="mt-2 text-xs text-danger">
              {{ servicesError }}
            </p>
          </fieldset>
          <label class="flex items-center gap-2.5 text-[13px]">
            <UiSwitch v-model="draft.active" label="Activo" />
            Activo (aparece en el sitio y recibe reservas)
          </label>
        </div>

        <div v-show="tab === 'schedule'" class="space-y-5">
          <div>
            <p class="mb-2 text-[13px] font-medium">
              Horario semanal
            </p>
            <AdminScheduleEditor v-model="draft.schedule" :business-hours="settings.settings.hours" />
            <p class="mt-2 text-xs text-muted">
              La barra gris es el horario del negocio; solo se ofrecen citas donde ambos coinciden.
            </p>
          </div>
          <div>
            <p class="mb-2 text-[13px] font-medium">
              Días libres específicos
            </p>
            <div class="flex gap-2">
              <UiInput v-model="newDayOff" type="date" :min="toISODate(now)" aria-label="Agregar día libre" class="w-48" />
              <UiButton variant="secondary" :disabled="!newDayOff" @click="addDayOff">
                Agregar
              </UiButton>
            </div>
            <ul v-if="draft.daysOff.length" class="mt-3 flex flex-wrap gap-1.5">
              <li v-for="d in [...draft.daysOff].sort()" :key="d">
                <span class="inline-flex h-7 items-center gap-1 rounded-full border border-border pl-3 pr-1 text-xs">
                  {{ formatDateShort(d) }}
                  <button type="button" class="grid size-5 place-items-center rounded-full text-muted hover:bg-surface-2 hover:text-foreground" :aria-label="`Quitar ${formatDateLong(d)}`" @click="draft.daysOff = draft.daysOff.filter(x => x !== d)">
                    <Icon name="lucide:x" class="size-3" />
                  </button>
                </span>
              </li>
            </ul>
            <p v-else class="mt-2 text-xs text-muted">
              Sin días libres programados (vacaciones, cursos, etc.).
            </p>
          </div>
        </div>
      </form>
      <template #footer>
        <UiButton variant="outline" @click="formOpen = false">
          Cancelar
        </UiButton>
        <UiButton type="submit" form="staff-form">
          {{ editing ? 'Guardar cambios' : 'Agregar' }}
        </UiButton>
      </template>
    </UiDialog>

    <UiConfirmDialog
      v-model:open="deleteOpen"
      :title="`¿Eliminar a ${toDelete?.name}?`"
      :description="toDelete && upcomingOf(toDelete.id) ? `Tiene ${pluralize(upcomingOf(toDelete.id), 'cita próxima', 'citas próximas')}. Reasígnalas desde la agenda o desactívalo en su lugar.` : 'Dejará de aparecer en el sitio y en la agenda.'"
      confirm-label="Eliminar"
      destructive
      @confirm="remove"
    />
  </div>
</template>
