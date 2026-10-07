<script setup lang="ts">
const { booking, formErrors } = useBooking()
const { terms } = useAppConfig()

// Los errores se muestran solo después de que el usuario toca cada campo (validación en vivo, no agresiva).
const touched = reactive<Record<string, boolean>>({})
const errorOf = (key: keyof typeof formErrors.value) => (touched[key] ? formErrors.value[key] : undefined)

/** Formatea el teléfono mientras se escribe: 33 1234 5678 */
function onPhoneInput(e: Event) {
  const digits = (e.target as HTMLInputElement).value.replace(/\D/g, '').slice(0, 10)
  booking.form.phone = [digits.slice(0, 2), digits.slice(2, 6), digits.slice(6)].filter(Boolean).join(' ')
}

const fields = [
  { key: 'name', label: 'Nombre completo', type: 'text', autocomplete: 'name', placeholder: 'Ej. Emiliano Gutiérrez', icon: 'lucide:user-round' },
  { key: 'phone', label: 'Teléfono (WhatsApp)', type: 'tel', autocomplete: 'tel-national', placeholder: '33 1234 5678', icon: 'lucide:phone' },
  { key: 'email', label: 'Correo electrónico', type: 'email', autocomplete: 'email', placeholder: 'tu@correo.com', icon: 'lucide:mail' },
] as const

defineExpose({ touchAll: () => fields.forEach(f => (touched[f.key] = true)) })
</script>

<template>
  <div>
    <header class="mb-6">
      <h1 class="text-2xl font-semibold tracking-tight sm:text-[28px]">
        Tus datos
      </h1>
      <p class="mt-1 text-sm text-muted">
        Solo para confirmar tu cita por WhatsApp. No enviamos publicidad.
      </p>
    </header>

    <form class="surface-card space-y-5 p-5 sm:p-6" novalidate @submit.prevent>
      <div v-for="field in fields" :key="field.key" class="space-y-1.5">
        <UiLabel :for="`f-${field.key}`">
          {{ field.label }}
        </UiLabel>
        <div class="relative">
          <UiInput
            :id="`f-${field.key}`"
            :model-value="booking.form[field.key]"
            :type="field.type"
            :icon="field.icon"
            :autocomplete="field.autocomplete"
            :placeholder="field.placeholder"
            :inputmode="field.key === 'phone' ? 'numeric' : undefined"
            :aria-invalid="!!errorOf(field.key)"
            :aria-describedby="errorOf(field.key) ? `e-${field.key}` : undefined"
            required
            @input="field.key === 'phone' ? onPhoneInput($event) : (booking.form[field.key] = ($event.target as HTMLInputElement).value)"
            @blur="touched[field.key] = true"
          />
          <Transition name="fade">
            <Icon
              v-if="booking.form[field.key] && !formErrors[field.key]"
              name="lucide:circle-check"
              class="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-success"
              aria-hidden="true"
            />
          </Transition>
        </div>
        <Transition name="fade">
          <p v-if="errorOf(field.key)" :id="`e-${field.key}`" class="flex items-center gap-1 text-xs text-danger" role="alert">
            <Icon name="lucide:circle-alert" class="size-3.5" />
            {{ errorOf(field.key) }}
          </p>
        </Transition>
      </div>

      <div class="space-y-1.5">
        <UiLabel for="f-notes" :hint="`${booking.form.notes.length}/300`">
          Notas para tu {{ terms.professional }} <span class="font-normal text-muted">(opcional)</span>
        </UiLabel>
        <UiTextarea
          id="f-notes"
          v-model="booking.form.notes"
          maxlength="300"
          rows="3"
          placeholder="Preferencias, alergias o cualquier indicación…"
        />
      </div>

      <p class="flex items-start gap-2 text-xs text-muted">
        <Icon name="lucide:shield-check" class="mt-px size-3.5 shrink-0" />
        Demo: los datos se guardan solo en este navegador (localStorage).
      </p>
    </form>
  </div>
</template>
