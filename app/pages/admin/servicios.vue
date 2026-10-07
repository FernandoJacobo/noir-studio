<script setup lang="ts">
import { toast } from 'vue-sonner'
import { z } from 'zod'
import type { Service } from '~~/types'
import { serviceCategories } from '~/data/services'

definePageMeta({ layout: 'admin', middleware: 'admin' })
useSeoMeta({ title: 'Servicios', robots: 'noindex' })

const services = useServicesStore()
const appointments = useAppointmentsStore()

const schema = z.object({
  name: z.string().trim().min(3, 'Mínimo 3 caracteres'),
  description: z.string().trim().max(180, 'Máximo 180 caracteres'),
  duration: z.number().int().min(15, 'Mínimo 15 min').max(240, 'Máximo 4 h').refine(v => v % 15 === 0, 'Múltiplos de 15 min'),
  price: z.number().min(0, 'No puede ser negativo').max(10000, 'Revisa el precio'),
  category: z.string().min(1, 'Elige una categoría'),
  image: z.string().trim().url('URL no válida').or(z.literal('')),
})

type Draft = { name: string, description: string, duration: number, price: number, category: string, image: string, active: boolean, popular: boolean }
const emptyDraft = (): Draft => ({ name: '', description: '', duration: 45, price: 300, category: serviceCategories[0].id, image: '', active: true, popular: false })

const editing = ref<string | null>(null)
const formOpen = ref(false)
const draft = reactive<Draft>(emptyDraft())
const submitted = ref(false)
const errors = computed(() => {
  const r = schema.safeParse(draft)
  if (r.success) return {} as Record<string, string>
  return Object.fromEntries(r.error.issues.map(i => [String(i.path[0]), i.message]))
})

function openCreate() {
  editing.value = null
  Object.assign(draft, emptyDraft())
  submitted.value = false
  formOpen.value = true
}

function openEdit(s: Service) {
  editing.value = s.id
  Object.assign(draft, { ...emptyDraft(), ...s, image: s.image ?? '', popular: !!s.popular })
  submitted.value = false
  formOpen.value = true
}

function save() {
  submitted.value = true
  if (Object.keys(errors.value).length) return
  const data = { ...draft, name: draft.name.trim(), description: draft.description.trim(), image: draft.image.trim() || undefined }
  if (editing.value) {
    services.update(editing.value, data)
    toast.success('Servicio actualizado')
  }
  else {
    services.create(data)
    toast.success('Servicio creado', { description: 'Ya aparece en el sitio y en el flujo de reservación.' })
  }
  formOpen.value = false
}

const toDelete = ref<Service | null>(null)
const deleteOpen = computed({ get: () => !!toDelete.value, set: v => !v && (toDelete.value = null) })
const usage = (id: string) => appointments.items.filter(a => a.serviceIds.includes(id)).length

function remove() {
  if (!toDelete.value) return
  const s = toDelete.value
  services.remove(s.id)
  toast(`“${s.name}” eliminado`, { action: { label: 'Deshacer', onClick: () => services.items.push(s) } })
}

function toggleActive(s: Service, v: boolean) {
  services.update(s.id, { active: v })
  toast(v ? `“${s.name}” activado` : `“${s.name}” desactivado`, { description: v ? 'Visible para reservar.' : 'Oculto del sitio público.' })
}

const filter = ref<string>('all')
const tabs = computed(() => [
  { value: 'all', label: 'Todos', count: services.items.length },
  ...serviceCategories.map(c => ({ value: c.id as string, label: c.label, count: services.items.filter(s => s.category === c.id).length })),
])
const visible = computed(() => services.items.filter(s => filter.value === 'all' || s.category === filter.value))
const categoryOptions = serviceCategories.map(c => ({ value: c.id as string, label: c.label, icon: c.icon }))
const durationOptions = [15, 30, 45, 60, 75, 90, 105, 120, 150, 180].map(v => ({ value: v, label: formatDuration(v) }))
const err = (k: string) => (submitted.value ? errors.value[k] : undefined)
</script>

<template>
  <div class="mx-auto max-w-7xl space-y-4 p-4 sm:p-6 lg:p-8">
    <header class="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 class="text-2xl font-semibold tracking-tight">
          Servicios
        </h1>
        <p class="mt-1 text-[13px] text-muted">
          {{ services.active.length }} activos de {{ services.items.length }}
        </p>
      </div>
      <UiButton size="sm" @click="openCreate">
        <Icon name="lucide:plus" class="size-4" />
        Nuevo servicio
      </UiButton>
    </header>

    <div class="overflow-x-auto scrollbar-none">
      <UiTabs v-model="filter" :items="tabs" size="sm" label="Categoría" />
    </div>

    <TransitionGroup v-if="visible.length" tag="ul" name="list" class="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      <li v-for="s in visible" :key="s.id" :class="cn('flex gap-4 surface-card p-4 transition-opacity', !s.active && 'opacity-60')">
        <SharedImg :src="s.image" :alt="s.name" class="size-20 shrink-0 rounded-[10px]" />
        <div class="flex min-w-0 flex-1 flex-col">
          <div class="flex items-start justify-between gap-2">
            <div class="min-w-0">
              <p class="truncate text-[14px] font-medium">
                {{ s.name }}
              </p>
              <p class="text-xs text-muted tabular-nums">
                {{ s.category }} · {{ formatDuration(s.duration) }}
              </p>
            </div>
            <p class="text-[15px] font-semibold tabular-nums">
              {{ formatPrice(s.price) }}
            </p>
          </div>
          <p class="mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted">
            {{ s.description }}
          </p>
          <div class="mt-auto flex items-center justify-between gap-2 pt-3">
            <label class="flex items-center gap-2 text-xs text-muted">
              <UiSwitch :model-value="s.active" :label="`${s.active ? 'Desactivar' : 'Activar'} ${s.name}`" @update:model-value="toggleActive(s, $event)" />
              {{ s.active ? 'Activo' : 'Inactivo' }}
            </label>
            <div class="flex gap-1">
              <UiTooltip content="Editar">
                <UiButton variant="ghost" size="icon-sm" :aria-label="`Editar ${s.name}`" @click="openEdit(s)">
                  <Icon name="lucide:pencil" class="size-4" />
                </UiButton>
              </UiTooltip>
              <UiTooltip content="Eliminar">
                <UiButton variant="ghost" size="icon-sm" class="hover:text-danger" :aria-label="`Eliminar ${s.name}`" @click="toDelete = s">
                  <Icon name="lucide:trash-2" class="size-4" />
                </UiButton>
              </UiTooltip>
            </div>
          </div>
        </div>
      </li>
    </TransitionGroup>
    <SharedEmptyState v-else icon="lucide:briefcase" title="Sin servicios en esta categoría" class="surface-card">
      <UiButton size="sm" variant="outline" @click="openCreate">
        Crear servicio
      </UiButton>
    </SharedEmptyState>

    <!-- Formulario -->
    <UiDialog v-model:open="formOpen" :title="editing ? 'Editar servicio' : 'Nuevo servicio'" size="lg">
      <form id="srv-form" class="grid gap-4 sm:grid-cols-2" novalidate @submit.prevent="save">
        <div class="space-y-1.5 sm:col-span-2">
          <UiLabel for="s-name">
            Nombre
          </UiLabel>
          <UiInput id="s-name" v-model="draft.name" :aria-invalid="!!err('name')" placeholder="Ej. Corte clásico" />
          <p v-if="err('name')" class="text-xs text-danger">
            {{ err('name') }}
          </p>
        </div>
        <div class="space-y-1.5 sm:col-span-2">
          <UiLabel for="s-desc" :hint="`${draft.description.length}/180`">
            Descripción
          </UiLabel>
          <UiTextarea id="s-desc" v-model="draft.description" rows="2" :aria-invalid="!!err('description')" />
          <p v-if="err('description')" class="text-xs text-danger">
            {{ err('description') }}
          </p>
        </div>
        <div class="space-y-1.5">
          <UiLabel for="s-cat">
            Categoría
          </UiLabel>
          <UiSelect id="s-cat" v-model="draft.category" :options="categoryOptions" />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div class="space-y-1.5">
            <UiLabel for="s-dur">
              Duración
            </UiLabel>
            <UiSelect id="s-dur" v-model="draft.duration" :options="durationOptions" />
          </div>
          <div class="space-y-1.5">
            <UiLabel for="s-price">
              Precio (MXN)
            </UiLabel>
            <UiInput id="s-price" v-model.number="draft.price" type="number" min="0" step="10" inputmode="numeric" :aria-invalid="!!err('price')" />
          </div>
        </div>
        <p v-if="err('price')" class="-mt-2 text-xs text-danger sm:col-start-2">
          {{ err('price') }}
        </p>
        <div class="space-y-1.5 sm:col-span-2">
          <UiLabel for="s-img" hint="Opcional">
            Imagen (URL)
          </UiLabel>
          <div class="flex gap-3">
            <SharedImg :src="draft.image || undefined" alt="Vista previa" class="size-10 shrink-0 rounded-[8px]" />
            <UiInput id="s-img" v-model="draft.image" type="url" placeholder="https://…" :aria-invalid="!!err('image')" />
          </div>
          <p v-if="err('image')" class="text-xs text-danger">
            {{ err('image') }}
          </p>
        </div>
        <label class="flex items-center gap-2.5 text-[13px]">
          <UiSwitch v-model="draft.active" label="Activo" />
          Activo (visible para reservar)
        </label>
        <label class="flex items-center gap-2.5 text-[13px]">
          <UiSwitch v-model="draft.popular" label="Popular" />
          Marcar como popular
        </label>
      </form>
      <template #footer>
        <UiButton variant="outline" @click="formOpen = false">
          Cancelar
        </UiButton>
        <UiButton type="submit" form="srv-form">
          {{ editing ? 'Guardar cambios' : 'Crear servicio' }}
        </UiButton>
      </template>
    </UiDialog>

    <UiConfirmDialog
      v-model:open="deleteOpen"
      :title="`¿Eliminar “${toDelete?.name}”?`"
      :description="toDelete && usage(toDelete.id) ? `Aparece en ${pluralize(usage(toDelete.id), 'cita')}; esas citas conservarán su precio, pero el servicio dejará de mostrarse. Si solo quieres ocultarlo, desactívalo.` : 'Esta acción no se puede deshacer después de cerrar el aviso.'"
      confirm-label="Eliminar"
      destructive
      @confirm="remove"
    />
  </div>
</template>
