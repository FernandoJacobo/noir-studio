<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { DialogClose, DialogContent, DialogDescription, DialogOverlay, DialogPortal, DialogRoot, DialogTitle, DialogTrigger, VisuallyHidden } from 'reka-ui'

const props = withDefaults(defineProps<{
  title: string
  description?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  hideTitle?: boolean
  class?: HTMLAttributes['class']
}>(), { size: 'md' })

const open = defineModel<boolean>('open', { default: false })

const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' }
</script>

<template>
  <DialogRoot v-model:open="open">
    <DialogTrigger v-if="$slots.trigger" as-child>
      <slot name="trigger" />
    </DialogTrigger>
    <DialogPortal>
      <DialogOverlay class="fixed inset-0 z-50 bg-black/55 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
      <DialogContent
        :class="cn(
          'fixed left-1/2 top-1/2 z-50 flex max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] -translate-x-1/2 -translate-y-1/2 flex-col surface-elevated outline-none',
          'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-[0.97] data-[state=open]:zoom-in-[0.97] duration-200',
          sizes[size],
          props.class,
        )"
      >
        <header v-if="!hideTitle" class="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
          <div class="min-w-0">
            <DialogTitle class="text-[15px] font-semibold tracking-tight">
              {{ title }}
            </DialogTitle>
            <DialogDescription v-if="description" class="mt-1 text-[13px] leading-relaxed text-muted">
              {{ description }}
            </DialogDescription>
          </div>
          <DialogClose class="-mr-1 -mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-foreground" aria-label="Cerrar">
            <Icon name="lucide:x" class="size-4" />
          </DialogClose>
        </header>
        <VisuallyHidden v-else>
          <DialogTitle>{{ title }}</DialogTitle>
          <DialogDescription v-if="description">
            {{ description }}
          </DialogDescription>
        </VisuallyHidden>

        <div class="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          <slot />
        </div>

        <footer v-if="$slots.footer" class="flex flex-col-reverse gap-2 border-t border-border px-5 py-3.5 sm:flex-row sm:justify-end">
          <slot name="footer" />
        </footer>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
