<script setup lang="ts">
import type { HTMLAttributes } from 'vue'

/** Imagen con carga diferida, fundido al cargar y placeholder elegante si falla. */
const props = withDefaults(defineProps<{
  src?: string
  alt: string
  icon?: string
  width?: number
  height?: number
  eager?: boolean
  class?: HTMLAttributes['class']
  imgClass?: HTMLAttributes['class']
}>(), { icon: 'lucide:scissors' })

const loaded = ref(false)
const failed = ref(false)
watch(() => props.src, () => {
  loaded.value = false
  failed.value = false
})
</script>

<template>
  <div :class="cn('relative overflow-hidden bg-surface-2', props.class)">
    <div
      v-if="!src || failed"
      class="absolute inset-0 grid place-items-center bg-[radial-gradient(120%_80%_at_30%_10%,color-mix(in_oklab,var(--accent)_16%,transparent),transparent_60%)]"
    >
      <div class="absolute inset-0 bg-grid opacity-40 mask-fade-b" />
      <Icon :name="icon" class="relative size-7 text-muted/60" />
    </div>
    <template v-else>
      <div v-if="!loaded" class="absolute inset-0 skeleton" />
      <img
        :src="src"
        :alt="alt"
        :width="width"
        :height="height"
        :loading="eager ? 'eager' : 'lazy'"
        :fetchpriority="eager ? 'high' : undefined"
        decoding="async"
        :class="cn('size-full object-cover transition-opacity duration-500', loaded ? 'opacity-100' : 'opacity-0', props.imgClass)"
        @load="loaded = true"
        @error="failed = true"
      >
    </template>
  </div>
</template>
