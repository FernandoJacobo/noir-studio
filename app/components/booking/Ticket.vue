<script setup lang="ts">
import type { ISODate, Minutes, Service, StaffMember } from '~~/types'

/** Resumen elegante tipo boleto. Se usa en la confirmación y en la pantalla de la cita. */
defineProps<{
  services: Service[]
  staff?: StaffMember
  date: ISODate
  start: Minutes
  duration: Minutes
  price: number
  clientName?: string
  folio?: string
}>()

const { brand } = useAppConfig()
</script>

<template>
  <div class="relative mx-auto w-full max-w-md">
    <div class="surface-elevated overflow-hidden">
      <!-- Cabecera -->
      <div class="relative overflow-hidden border-b border-dashed border-border-strong px-6 pb-6 pt-5">
        <div class="absolute inset-0 bg-[radial-gradient(90%_120%_at_100%_0%,color-mix(in_oklab,var(--accent)_16%,transparent),transparent_60%)]" aria-hidden="true" />
        <div class="relative flex items-start justify-between gap-4">
          <SharedLogo size="sm" />
          <div v-if="folio" class="text-right">
            <p class="text-[10px] uppercase tracking-[0.18em] text-muted">
              Folio
            </p>
            <p class="font-mono text-[13px] font-semibold tracking-wider">
              {{ folio }}
            </p>
          </div>
        </div>
        <p class="relative mt-6 text-[11px] uppercase tracking-[0.18em] text-muted">
          {{ formatDateFns(date, 'EEEE') }}
        </p>
        <p class="relative text-display text-4xl leading-tight first-letter:uppercase">
          {{ formatDateFns(date, "d 'de' MMMM") }}
        </p>
        <p class="relative mt-1 text-lg font-semibold tabular-nums tracking-tight">
          {{ formatTimeRange(start, duration) }}
        </p>
      </div>

      <!-- Muescas laterales -->
      <div class="relative h-0" aria-hidden="true">
        <span class="absolute -left-3 -top-3 size-6 rounded-full border border-border bg-background" />
        <span class="absolute -right-3 -top-3 size-6 rounded-full border border-border bg-background" />
      </div>

      <!-- Detalle -->
      <div class="space-y-4 px-6 py-5">
        <div v-if="staff" class="flex items-center gap-3">
          <SharedAvatar :name="staff.name" :src="staff.photo" class="size-10" />
          <div class="min-w-0">
            <p class="text-[13px] font-medium">
              {{ staff.name }}
            </p>
            <p class="truncate text-xs text-muted">
              {{ staff.role }}
            </p>
          </div>
        </div>

        <ul class="space-y-2 border-t border-border pt-4">
          <li v-for="s in services" :key="s.id" class="flex items-baseline justify-between gap-3 text-[13px]">
            <span>
              {{ s.name }}
              <span class="text-xs text-muted tabular-nums">· {{ formatDuration(s.duration) }}</span>
            </span>
            <span class="tabular-nums">{{ formatPrice(s.price) }}</span>
          </li>
        </ul>

        <div class="flex items-baseline justify-between border-t border-border pt-4">
          <span class="text-[13px] text-muted">Total · pago en sucursal</span>
          <span class="text-xl font-semibold tabular-nums tracking-tight">{{ formatPrice(price) }}</span>
        </div>

        <div class="flex items-start gap-2 rounded-[10px] bg-surface-2 px-3 py-2.5 text-xs text-muted">
          <Icon name="lucide:map-pin" class="mt-px size-3.5 shrink-0" />
          <span>{{ brand.address }}</span>
        </div>

        <p v-if="clientName" class="text-center text-xs text-muted">
          A nombre de <span class="font-medium text-foreground">{{ clientName }}</span>
        </p>
      </div>
    </div>
  </div>
</template>
