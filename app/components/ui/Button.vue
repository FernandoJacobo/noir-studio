<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import type { RouteLocationRaw } from 'vue-router'
import { NuxtLink } from '#components'

const props = withDefaults(defineProps<{
  variant?: ButtonVariants['variant']
  size?: ButtonVariants['size']
  pill?: boolean
  to?: RouteLocationRaw
  href?: string
  target?: string
  loading?: boolean
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
  class?: HTMLAttributes['class']
}>(), { type: 'button', variant: 'primary', size: 'md' })

const isLink = computed(() => !!(props.to || props.href))
</script>

<template>
  <NuxtLink
    v-if="isLink"
    :to="to ?? href"
    :target="target"
    :external="!!href"
    :aria-disabled="disabled || undefined"
    :class="cn(buttonVariants({ variant, size, pill }), props.class)"
  >
    <slot />
  </NuxtLink>
  <button
    v-else
    :type="type"
    :disabled="disabled || loading"
    :aria-busy="loading || undefined"
    :class="cn(buttonVariants({ variant, size, pill }), props.class)"
  >
    <Icon v-if="loading" name="lucide:loader-circle" class="size-4 animate-spin" />
    <slot />
  </button>
</template>
