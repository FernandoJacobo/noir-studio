<script setup lang="ts">
const { copy, terms } = useAppConfig()
const staff = useStaffStore()
</script>

<template>
  <section id="equipo" class="scroll-mt-20 border-y border-border bg-surface/40" aria-labelledby="equipo-title">
    <div class="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
      <SharedSectionHeading id="equipo-title" eyebrow="Equipo" :title="copy.teamTitle" :subtitle="copy.teamSubtitle" />

      <ul class="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <li v-for="member in staff.active" :key="member.id" class="group">
          <div class="relative overflow-hidden rounded-[14px] border border-border">
            <SharedImg
              :src="member.photo"
              :alt="member.name"
              icon="lucide:user-round"
              :width="480"
              :height="600"
              class="aspect-[4/5]"
              img-class="grayscale transition-[filter,transform] duration-700 group-hover:scale-[1.03] group-hover:grayscale-0"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-black/75 via-black/5 to-transparent" />
            <div class="absolute inset-x-0 bottom-0 p-4 text-white">
              <p class="text-[17px] font-semibold tracking-tight">
                {{ member.name }}
              </p>
              <p class="text-xs text-white/70">
                {{ member.role }}
              </p>
            </div>
            <NuxtLink
              :to="{ path: '/reservar', query: { profesional: member.id } }"
              class="absolute right-3 top-3 inline-flex translate-y-1 items-center gap-1 rounded-full bg-white/90 px-3 py-1.5 text-xs font-medium text-black opacity-0 shadow-lg transition-all duration-300 focus-visible:translate-y-0 focus-visible:opacity-100 group-hover:translate-y-0 group-hover:opacity-100"
              :aria-label="`Reservar con ${member.name}`"
            >
              Reservar
              <Icon name="lucide:arrow-up-right" class="size-3" />
            </NuxtLink>
          </div>
          <p class="mt-4 text-[13px] leading-relaxed text-muted">
            {{ member.bio }}
          </p>
          <ul class="mt-3 flex flex-wrap gap-1.5" :aria-label="`Especialidades de ${member.name}`">
            <li v-for="s in member.specialties" :key="s">
              <UiBadge>{{ s }}</UiBadge>
            </li>
          </ul>
        </li>
      </ul>
      <p class="sr-only">
        Puedes elegir a tu {{ terms.professional }} al reservar.
      </p>
    </div>
  </section>
</template>
