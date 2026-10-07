<script setup lang="ts">
/**
 * Renderiza su contenido cuando está por entrar al viewport (o al navegar a su ancla).
 * Reduce el trabajo inicial del SPA en la landing sin afectar los enlaces ancla.
 */
const props = withDefaults(defineProps<{ id?: string, minHeight?: string }>(), { minHeight: '600px' })

const el = useTemplateRef<HTMLElement>('el')
const visible = ref(false)
const route = useRoute()

if (props.id && route.hash === `#${props.id}`) visible.value = true

const { stop } = useIntersectionObserver(el, ([entry]) => {
  if (entry?.isIntersecting) {
    visible.value = true
    stop()
  }
}, { rootMargin: '400px 0px' })

// Al hacer clic en un ancla hacia otra sección diferida, se renderiza antes del scroll.
watch(() => route.hash, (hash) => {
  if (props.id && hash === `#${props.id}`) visible.value = true
})
</script>

<template>
  <div :id="id" ref="el" class="scroll-mt-20" :style="visible ? undefined : { minHeight }">
    <slot v-if="visible" />
  </div>
</template>
