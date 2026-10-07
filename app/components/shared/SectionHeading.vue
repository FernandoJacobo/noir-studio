<script setup lang="ts">
defineProps<{ eyebrow?: string, title: string, subtitle?: string, id?: string }>()
</script>

<template>
  <div class="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
    <div class="max-w-2xl">
      <p v-if="eyebrow" class="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-muted">
        {{ eyebrow }}
      </p>
      <h2 :id="id" class="text-3xl font-semibold tracking-[-0.035em] sm:text-[2.6rem] sm:leading-[1.05]">
        {{ title }}
      </h2>
      <p v-if="subtitle" class="mt-3 text-[15px] leading-relaxed text-muted">
        {{ subtitle }}
      </p>
    </div>
    <slot />
  </div>
</template>
