<script setup lang="ts">
const { booking, totals, chosenStaff, assignedStaff } = useBooking()
const { terms } = useAppConfig()

const date = computed({
  get: () => booking.date,
  set: (v) => {
    booking.date = v
    booking.clearSlot()
  },
})
</script>

<template>
  <div>
    <header class="mb-6">
      <h1 class="text-2xl font-semibold tracking-tight sm:text-[28px]">
        ¿Cuándo te esperamos?
      </h1>
      <p class="mt-1 text-sm text-muted">
        Horarios calculados en tiempo real para {{ formatDuration(totals.duration) }} de servicio
        {{ chosenStaff ? `con ${chosenStaff.name}` : `con cualquier ${terms.professional}` }}.
      </p>
    </header>

    <BookingDateTimePicker
      v-model:date="date"
      :service-ids="booking.serviceIds"
      :staff-id="booking.staffId ?? 'any'"
      :start="booking.start"
      @select="({ date: d, start, staffId }) => booking.setSlot(d, start, staffId)"
    />

    <Transition name="fade">
      <p v-if="booking.staffId === 'any' && assignedStaff && booking.start !== null" class="mt-5 flex items-center gap-2.5 rounded-[10px] border border-border bg-surface px-3 py-2.5 text-[13px]">
        <SharedAvatar :name="assignedStaff.name" :src="assignedStaff.photo" class="size-7" />
        <span>Te atenderá <strong class="font-medium">{{ assignedStaff.name }}</strong> a las {{ formatTime(booking.start) }}.</span>
      </p>
    </Transition>
  </div>
</template>
