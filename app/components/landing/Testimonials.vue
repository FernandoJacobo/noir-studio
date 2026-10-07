<script setup lang="ts">
import { testimonials } from '~/data/testimonials'

const { copy } = useAppConfig()
const half = Math.ceil(testimonials.length / 2)
const rows = [testimonials.slice(0, half), testimonials.slice(half)]
</script>

<template>
  <section class="overflow-hidden py-20 sm:py-28" aria-labelledby="opiniones-title">
    <div class="mx-auto max-w-6xl px-4 sm:px-6">
      <SharedSectionHeading id="opiniones-title" eyebrow="Opiniones" :title="copy.testimonialsTitle" />
    </div>

    <div class="mt-12 flex flex-col gap-4 mask-fade-x">
      <div
        v-for="(row, r) in rows"
        :key="r"
        class="group flex w-max gap-4 motion-safe:animate-marquee hover:[animation-play-state:paused] motion-reduce:w-full motion-reduce:overflow-x-auto motion-reduce:px-4"
        :style="{ '--marquee-duration': r === 0 ? '70s' : '85s', animationDirection: r === 1 ? 'reverse' : 'normal' }"
      >
        <!-- Se duplica la fila para un loop continuo; la copia se oculta a lectores de pantalla -->
        <template v-for="copyIndex in 2" :key="copyIndex">
          <figure
            v-for="t in row"
            :key="`${copyIndex}-${t.name}`"
            :aria-hidden="copyIndex === 2 || undefined"
            :class="cn('w-[300px] shrink-0 surface-card p-5 sm:w-[360px]', copyIndex === 2 && 'motion-reduce:hidden')"
          >
            <SharedStars :rating="t.rating" />
            <blockquote class="mt-3 text-[14px] leading-relaxed">
              “{{ t.text }}”
            </blockquote>
            <figcaption class="mt-4 flex items-center gap-2.5 border-t border-border pt-4">
              <SharedAvatar :name="t.name" class="size-7 text-[10px]" />
              <span class="text-[13px] font-medium">{{ t.name }}</span>
              <span class="ml-auto text-xs text-muted">{{ t.service }}</span>
            </figcaption>
          </figure>
        </template>
      </div>
    </div>
  </section>
</template>
