<script setup lang="ts">
const { booking, selectedServices, totals, assignedStaff } = useBooking()
</script>

<template>
  <div>
    <header class="mb-6">
      <h1 class="text-2xl font-semibold tracking-tight sm:text-[28px]">
        Revisa y confirma
      </h1>
      <p class="mt-1 text-sm text-muted">
        Te enviaremos la confirmación por WhatsApp al {{ formatPhone(booking.form.phone) }}.
      </p>
    </header>

    <BookingTicket
      v-if="booking.date && booking.start !== null"
      :services="selectedServices"
      :staff="assignedStaff"
      :date="booking.date"
      :start="booking.start"
      :duration="totals.duration"
      :price="totals.price"
      :client-name="booking.form.name"
    />

    <ul class="mx-auto mt-6 max-w-md space-y-2 text-xs text-muted">
      <li class="flex items-start gap-2">
        <Icon name="lucide:calendar-clock" class="mt-px size-3.5 shrink-0" />
        Puedes reagendar o cancelar sin costo desde el enlace de tu cita.
      </li>
      <li class="flex items-start gap-2">
        <Icon name="lucide:timer" class="mt-px size-3.5 shrink-0" />
        Tolerancia de 10 minutos; después podríamos reasignar tu horario.
      </li>
    </ul>
  </div>
</template>
