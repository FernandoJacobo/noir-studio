<script setup lang="ts">
definePageMeta({ layout: 'focus' })
useSeoMeta({ title: 'Reservar cita', description: 'Elige servicio, profesional y horario. Reserva en línea en menos de un minuto.' })

const route = useRoute()
const router = useRouter()
const { booking, stepValid, canAdvance, canVisit, direction, goTo, next, back, sanitize, confirm, submitting, totals, selectedServices } = useBooking()

// Entrada con servicio o profesional preseleccionado desde la landing.
const preService = typeof route.query.servicio === 'string' ? route.query.servicio : undefined
const preStaff = typeof route.query.profesional === 'string' ? route.query.profesional : undefined
if (preService || preStaff) {
  booking.startNew(preService)
  if (preStaff) booking.staffId = preStaff
  router.replace({ query: {} })
}
sanitize()

const steps = [
  resolveComponent('BookingStepService'),
  resolveComponent('BookingStepStaff'),
  resolveComponent('BookingStepDateTime'),
  resolveComponent('BookingStepDetails'),
  resolveComponent('BookingStepConfirm'),
]

const detailsRef = shallowRef<{ touchAll: () => void } | null>(null)
function setStepRef(el: unknown) {
  detailsRef.value = el && typeof (el as { touchAll?: unknown }).touchAll === 'function' ? el as { touchAll: () => void } : null
}
const isLast = computed(() => booking.step === BOOKING_STEPS.length - 1)
const summaryOpen = ref(false)

const primaryLabel = computed(() => {
  if (isLast.value) return 'Confirmar cita'
  if (booking.step === 3) return 'Revisar cita'
  return 'Continuar'
})

/** Pista de qué falta cuando el botón está deshabilitado. */
const hint = computed(() => {
  if (canAdvance.value) return ''
  return ['Elige al menos un servicio', 'Elige un profesional', 'Elige día y horario', 'Completa tus datos', ''][booking.step]
})

async function primary() {
  if (booking.step === 3 && !canAdvance.value) {
    detailsRef.value?.touchAll()
    return
  }
  if (!isLast.value) return next()
  const id = await confirm()
  if (id) await router.push({ path: `/cita/${id}`, query: { nueva: '1' } })
}

// Al elegir horario se avanza solo: menos clics en móvil.
watch(() => booking.start, (v, old) => {
  if (v !== null && old === null && booking.step === 2) setTimeout(next, 220)
})
// Al elegir profesional también.
watch(() => booking.staffId, (v, old) => {
  if (v && v !== old && booking.step === 1 && stepValid.value[1]) setTimeout(next, 200)
})

// Atajos: Alt+← / Alt+→ para navegar entre pasos.
onKeyStroke(['ArrowLeft', 'ArrowRight'], (e) => {
  if (!e.altKey) return
  e.preventDefault()
  if (e.key === 'ArrowLeft') back()
  else if (canAdvance.value && !isLast.value) next()
})
</script>

<template>
  <div class="mx-auto max-w-6xl px-4 pb-40 pt-6 sm:px-6 sm:pt-8 lg:pb-16">
    <BookingStepper :current="booking.step" :can-visit="canVisit" :completed="stepValid" class="mb-8" @go="goTo" />

    <div class="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-10">
      <div class="min-w-0">
        <button
          v-if="booking.step > 0"
          type="button"
          class="mb-4 inline-flex items-center gap-1 text-[13px] text-muted transition-colors hover:text-foreground"
          @click="back"
        >
          <Icon name="lucide:arrow-left" class="size-4" />
          Atrás
        </button>
        <div class="relative">
          <Transition :name="`step-${direction}`" mode="out-in">
            <component :is="steps[booking.step]" :key="booking.step" :ref="setStepRef" />
          </Transition>
        </div>
      </div>

      <!-- Resumen fijo (desktop) -->
      <aside class="hidden lg:block" aria-label="Resumen de la cita">
        <div class="sticky top-24 surface-card p-5">
          <p class="mb-4 text-[15px] font-semibold tracking-tight">
            Tu cita
          </p>
          <BookingSummary />
          <UiButton class="mt-6 w-full" size="lg" :disabled="!canAdvance && booking.step !== 3" :loading="submitting" @click="primary">
            {{ primaryLabel }}
            <Icon v-if="!submitting" :name="isLast ? 'lucide:check' : 'lucide:arrow-right'" class="size-4" />
          </UiButton>
          <p class="mt-2.5 min-h-4 text-center text-xs text-muted">
            {{ hint }}
          </p>
          <p class="mt-1 hidden text-center text-[11px] text-muted/80 xl:block">
            <UiKbd>Alt</UiKbd> + <UiKbd>←</UiKbd> <UiKbd>→</UiKbd> para navegar
          </p>
        </div>
      </aside>
    </div>

    <!-- Bottom sheet colapsable (móvil) -->
    <div class="fixed inset-x-0 bottom-0 z-30 lg:hidden">
      <div class="mx-2 mb-2 surface-elevated overflow-hidden pb-[env(safe-area-inset-bottom)]">
        <button
          type="button"
          class="flex w-full items-center justify-between gap-3 px-4 pt-3 text-left"
          :aria-expanded="summaryOpen"
          aria-controls="mobile-summary"
          @click="summaryOpen = !summaryOpen"
        >
          <span class="min-w-0">
            <span class="block text-[11px] text-muted">
              {{ selectedServices.length ? `${selectedServices.length} servicio${selectedServices.length > 1 ? 's' : ''} · ${formatDuration(totals.duration)}` : 'Tu cita' }}
            </span>
            <span class="block text-base font-semibold tabular-nums">{{ formatPrice(totals.price) }}</span>
          </span>
          <span class="inline-flex items-center gap-1 text-xs text-muted">
            {{ summaryOpen ? 'Ocultar' : 'Ver resumen' }}
            <Icon name="lucide:chevron-up" :class="cn('size-4 transition-transform duration-300', summaryOpen && 'rotate-180')" />
          </span>
        </button>
        <div id="mobile-summary" class="grid transition-[grid-template-rows] duration-300 ease-[var(--ease-out-soft)]" :style="{ gridTemplateRows: summaryOpen ? '1fr' : '0fr' }">
          <div class="overflow-hidden">
            <div class="px-4 pb-1 pt-4">
              <BookingSummary />
            </div>
          </div>
        </div>
        <div class="flex gap-2 p-3">
          <UiButton v-if="booking.step > 0" variant="outline" size="lg" class="px-4" aria-label="Paso anterior" @click="back">
            <Icon name="lucide:arrow-left" class="size-4" />
          </UiButton>
          <UiButton class="flex-1" size="lg" :disabled="!canAdvance && booking.step !== 3" :loading="submitting" @click="primary">
            {{ hint && booking.step !== 3 ? hint : primaryLabel }}
            <Icon v-if="!submitting && !hint" :name="isLast ? 'lucide:check' : 'lucide:arrow-right'" class="size-4" />
          </UiButton>
        </div>
      </div>
    </div>
  </div>
</template>
