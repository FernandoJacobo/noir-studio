<script setup lang="ts">
import { toast } from 'vue-sonner'
import type { BusinessSettings } from '~~/types'

definePageMeta({ layout: 'admin', middleware: 'admin' })
useSeoMeta({ title: 'Configuración', robots: 'noindex' })

const store = useSettingsStore()
const { reset } = useDemo()
const { booking } = useAppConfig()

const clone = (s: BusinessSettings): BusinessSettings => JSON.parse(JSON.stringify(s))
const draft = ref<BusinessSettings>(clone(store.settings))
const dirty = computed(() => JSON.stringify({ ...draft.value, accent: '' }) !== JSON.stringify({ ...store.settings, accent: '' }))

// Si otra pestaña cambia la configuración y aquí no hay cambios pendientes, se refleja.
watch(() => store.settings, (s) => {
  if (!dirty.value) draft.value = clone(s)
}, { deep: true })

function save() {
  store.update(clone(draft.value))
  toast.success('Configuración guardada', { description: 'Los horarios disponibles ya usan los nuevos valores.' })
}

function discard() {
  draft.value = clone(store.settings)
}

// ── Acento con vista previa en vivo ──
const ACCENTS = [
  { name: 'Champagne', value: '#C9B38A' },
  { name: 'Cobre', value: '#C08A64' },
  { name: 'Salvia', value: '#93A88E' },
  { name: 'Niebla', value: '#9AA7B8' },
  { name: 'Lavanda', value: '#A99BC4' },
  { name: 'Marfil', value: '#E4DED2' },
]
const accent = computed({
  get: () => store.settings.accent,
  set: v => store.update({ accent: v }),
})

const intervalOptions = [10, 15, 20, 30, 60].map(v => ({ value: v, label: `${v} min` }))
const bufferOptions = [0, 5, 10, 15, 30].map(v => ({ value: v, label: v ? `${v} min` : 'Sin margen' }))
const advanceOptions = [
  { value: 0, label: 'Sin anticipación' },
  { value: 30, label: '30 minutos' },
  { value: 60, label: '1 hora' },
  { value: 120, label: '2 horas' },
  { value: 240, label: '4 horas' },
  { value: 1440, label: '1 día' },
]
const aheadOptions = [14, 30, 45, 60, 90].map(v => ({ value: v, label: `${v} días` }))

const resetOpen = ref(false)
function doReset() {
  reset()
  draft.value = clone(store.settings)
  toast.success('Demo restablecido', { description: 'Datos semilla cargados con fechas relativas a hoy.' })
}

const sections = [
  { id: 'negocio', label: 'Negocio' },
  { id: 'horario', label: 'Horario' },
  { id: 'reservas', label: 'Reservas' },
  { id: 'apariencia', label: 'Apariencia' },
  { id: 'demo', label: 'Demo' },
]
</script>

<template>
  <div class="mx-auto max-w-5xl p-4 pb-28 sm:p-6 sm:pb-28 lg:p-8 lg:pb-28">
    <header class="mb-6">
      <h1 class="text-2xl font-semibold tracking-tight">
        Configuración
      </h1>
      <p class="mt-1 text-[13px] text-muted">
        Datos del negocio, horario y reglas de reservación.
      </p>
    </header>

    <div class="grid gap-8 lg:grid-cols-[180px_minmax(0,1fr)]">
      <nav class="hidden lg:block" aria-label="Secciones">
        <ul class="sticky top-20 space-y-0.5 text-[13px]">
          <li v-for="s in sections" :key="s.id">
            <a :href="`#${s.id}`" class="block rounded-[8px] px-2.5 py-1.5 text-muted transition-colors hover:bg-surface-2 hover:text-foreground">{{ s.label }}</a>
          </li>
        </ul>
      </nav>

      <div class="space-y-6">
        <!-- Negocio -->
        <section id="negocio" class="scroll-mt-20 surface-card p-5 sm:p-6" aria-labelledby="h-negocio">
          <h2 id="h-negocio" class="text-[15px] font-semibold tracking-tight">
            Datos del negocio
          </h2>
          <p class="mt-0.5 text-[13px] text-muted">
            Se usan en confirmaciones, .ics y mensajes de WhatsApp.
          </p>
          <div class="mt-5 grid gap-4 sm:grid-cols-2">
            <div class="space-y-1.5">
              <UiLabel for="c-name">
                Nombre
              </UiLabel>
              <UiInput id="c-name" v-model="draft.name" />
            </div>
            <div class="space-y-1.5">
              <UiLabel for="c-email">
                Correo
              </UiLabel>
              <UiInput id="c-email" v-model="draft.email" type="email" />
            </div>
            <div class="space-y-1.5">
              <UiLabel for="c-phone">
                Teléfono
              </UiLabel>
              <UiInput id="c-phone" v-model="draft.phone" type="tel" />
            </div>
            <div class="space-y-1.5">
              <UiLabel for="c-wa">
                WhatsApp
              </UiLabel>
              <UiInput id="c-wa" v-model="draft.whatsapp" type="tel" />
            </div>
            <div class="space-y-1.5 sm:col-span-2">
              <UiLabel for="c-addr">
                Dirección
              </UiLabel>
              <UiInput id="c-addr" v-model="draft.address" />
            </div>
          </div>
        </section>

        <!-- Horario -->
        <section id="horario" class="scroll-mt-20 surface-card p-5 sm:p-6" aria-labelledby="h-horario">
          <h2 id="h-horario" class="text-[15px] font-semibold tracking-tight">
            Horario del negocio
          </h2>
          <p class="mb-5 mt-0.5 text-[13px] text-muted">
            Los horarios de cada profesional se recortan a este horario.
          </p>
          <AdminScheduleEditor v-model="draft.hours" />
        </section>

        <!-- Reservas -->
        <section id="reservas" class="scroll-mt-20 surface-card p-5 sm:p-6" aria-labelledby="h-reservas">
          <h2 id="h-reservas" class="text-[15px] font-semibold tracking-tight">
            Reglas de reservación
          </h2>
          <div class="mt-5 grid gap-5 sm:grid-cols-2">
            <div class="space-y-1.5">
              <UiLabel for="c-int">
                Intervalo entre horarios
              </UiLabel>
              <UiSelect id="c-int" v-model="draft.slotInterval" :options="intervalOptions" />
              <p class="text-xs text-muted">
                Cada cuánto se ofrece un horario de inicio.
              </p>
            </div>
            <div class="space-y-1.5">
              <UiLabel for="c-buf">
                Margen entre citas
              </UiLabel>
              <UiSelect id="c-buf" v-model="draft.bufferMinutes" :options="bufferOptions" />
              <p class="text-xs text-muted">
                Tiempo de limpieza antes y después de cada cita.
              </p>
            </div>
            <div class="space-y-1.5">
              <UiLabel for="c-adv">
                Anticipación mínima
              </UiLabel>
              <UiSelect id="c-adv" v-model="draft.minAdvanceMinutes" :options="advanceOptions" />
              <p class="text-xs text-muted">
                Para reservas en línea. El panel puede agendar sin anticipación.
              </p>
            </div>
            <div class="space-y-1.5">
              <UiLabel for="c-ahead">
                Reservar hasta
              </UiLabel>
              <UiSelect id="c-ahead" v-model="draft.maxDaysAhead" :options="aheadOptions" />
              <p class="text-xs text-muted">
                Días hacia adelante visibles en el calendario.
              </p>
            </div>
          </div>
        </section>

        <!-- Apariencia -->
        <section id="apariencia" class="scroll-mt-20 surface-card p-5 sm:p-6" aria-labelledby="h-apariencia">
          <h2 id="h-apariencia" class="text-[15px] font-semibold tracking-tight">
            Apariencia
          </h2>
          <p class="mt-0.5 text-[13px] text-muted">
            El acento se aplica al instante en todo el sitio y el panel.
          </p>
          <div class="mt-5 grid gap-6 md:grid-cols-[minmax(0,1fr)_260px]">
            <div class="space-y-5">
              <div>
                <p class="mb-2.5 text-[13px] font-medium">
                  Color de acento
                </p>
                <div role="radiogroup" aria-label="Color de acento" class="flex flex-wrap gap-2.5">
                  <UiTooltip v-for="a in ACCENTS" :key="a.value" :content="a.name">
                    <button
                      type="button"
                      role="radio"
                      :aria-checked="accent.toLowerCase() === a.value.toLowerCase()"
                      :aria-label="a.name"
                      :class="cn('relative size-9 rounded-full border border-border transition-transform hover:scale-105', accent.toLowerCase() === a.value.toLowerCase() && 'ring-2 ring-foreground ring-offset-2 ring-offset-surface')"
                      :style="{ background: a.value }"
                      @click="accent = a.value"
                    >
                      <Icon v-if="accent.toLowerCase() === a.value.toLowerCase()" name="lucide:check" class="absolute inset-0 m-auto size-4" :style="{ color: readableForeground(a.value) }" />
                    </button>
                  </UiTooltip>
                  <label class="relative grid size-9 cursor-pointer place-items-center rounded-full border border-dashed border-border-strong text-muted hover:text-foreground" title="Personalizado">
                    <Icon name="lucide:pipette" class="size-4" />
                    <input v-model="accent" type="color" class="absolute inset-0 cursor-pointer opacity-0" aria-label="Color personalizado">
                  </label>
                </div>
                <p class="mt-2 font-mono text-xs uppercase text-muted">
                  {{ accent }}
                  <button v-if="accent.toLowerCase() !== booking.accent.toLowerCase()" type="button" class="ml-2 normal-case underline-offset-4 hover:text-foreground hover:underline" @click="accent = booking.accent">
                    Restablecer
                  </button>
                </p>
              </div>
              <div>
                <p class="mb-2.5 text-[13px] font-medium">
                  Tema
                </p>
                <SharedThemeSelect />
              </div>
            </div>

            <!-- Vista previa en vivo -->
            <div class="rounded-[14px] border border-border bg-background p-4" aria-label="Vista previa">
              <p class="mb-3 text-[11px] uppercase tracking-wider text-muted">
                Vista previa
              </p>
              <div class="surface-card p-3.5">
                <div class="flex items-center justify-between">
                  <span class="text-[13px] font-medium">Corte clásico</span>
                  <UiBadge tone="accent">
                    Popular
                  </UiBadge>
                </div>
                <div class="mt-3 grid grid-cols-3 gap-1.5">
                  <span class="rounded-[8px] border border-border py-1.5 text-center text-xs tabular-nums">10:00</span>
                  <span class="rounded-[8px] bg-accent py-1.5 text-center text-xs font-medium text-accent-foreground tabular-nums">10:30</span>
                  <span class="rounded-[8px] border border-border py-1.5 text-center text-xs tabular-nums">11:00</span>
                </div>
                <p class="mt-3 text-display text-2xl leading-none text-accent-ink">
                  a tu hora.
                </p>
              </div>
            </div>
          </div>
        </section>

        <!-- Demo -->
        <section id="demo" class="scroll-mt-20 rounded-[12px] border border-danger/25 bg-danger/5 p-5 sm:p-6" aria-labelledby="h-demo">
          <div class="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 id="h-demo" class="text-[15px] font-semibold tracking-tight">
                Restablecer demo
              </h2>
              <p class="mt-0.5 max-w-lg text-[13px] text-muted">
                Borra citas, clientes, servicios y cambios de configuración, y vuelve a cargar los datos semilla con fechas relativas a hoy.
              </p>
            </div>
            <UiButton variant="danger" @click="resetOpen = true">
              <Icon name="lucide:rotate-ccw" class="size-4" />
              Restablecer demo
            </UiButton>
          </div>
        </section>
      </div>
    </div>

    <!-- Barra de guardado -->
    <Transition
      enter-active-class="transition duration-300 ease-[var(--ease-out-soft)]"
      enter-from-class="translate-y-6 opacity-0"
      leave-active-class="transition duration-200"
      leave-to-class="translate-y-6 opacity-0"
    >
      <div v-if="dirty" class="fixed inset-x-0 bottom-4 z-30 flex justify-center px-4">
        <div class="flex items-center gap-3 surface-elevated py-2 pl-4 pr-2 text-[13px]" role="status">
          <span class="size-2 rounded-full bg-warning" />
          Tienes cambios sin guardar
          <UiButton variant="ghost" size="sm" @click="discard">
            Descartar
          </UiButton>
          <UiButton size="sm" @click="save">
            Guardar
          </UiButton>
        </div>
      </div>
    </Transition>

    <UiConfirmDialog
      v-model:open="resetOpen"
      title="¿Restablecer el demo?"
      description="Se perderán todas las citas y cambios que hayas hecho. Esta acción no se puede deshacer."
      confirm-label="Restablecer"
      destructive
      @confirm="doReset"
    />
  </div>
</template>
