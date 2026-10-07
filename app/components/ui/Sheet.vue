<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { DialogClose, DialogContent, DialogDescription, DialogOverlay, DialogPortal, DialogRoot, DialogTitle } from 'reka-ui'

const props = withDefaults(defineProps<{
  title: string
  description?: string
  side?: 'right' | 'left' | 'bottom'
  class?: HTMLAttributes['class']
}>(), { side: 'right' })

const open = defineModel<boolean>('open', { default: false })

const sides = {
  right: 'inset-y-2 right-2 w-[calc(100vw-1rem)] max-w-md data-[state=open]:slide-in-from-right-8 data-[state=closed]:slide-out-to-right-8',
  left: 'inset-y-2 left-2 w-[calc(100vw-1rem)] max-w-xs data-[state=open]:slide-in-from-left-8 data-[state=closed]:slide-out-to-left-8',
  bottom: 'inset-x-2 bottom-2 max-h-[85dvh] data-[state=open]:slide-in-from-bottom-8 data-[state=closed]:slide-out-to-bottom-8',
}
</script>

<template>
  <DialogRoot v-model:open="open">
    <DialogPortal>
      <DialogOverlay class="fixed inset-0 z-50 bg-black/50 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
      <DialogContent
        :class="cn(
          'fixed z-50 flex flex-col surface-elevated outline-none duration-300 ease-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
          sides[side],
          props.class,
        )"
      >
        <header class="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
          <div class="min-w-0">
            <slot name="eyebrow" />
            <DialogTitle class="text-[15px] font-semibold tracking-tight">
              {{ title }}
            </DialogTitle>
            <DialogDescription v-if="description" class="mt-0.5 text-[13px] text-muted">
              {{ description }}
            </DialogDescription>
          </div>
          <DialogClose class="-mr-1 grid size-8 shrink-0 place-items-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-foreground" aria-label="Cerrar">
            <Icon name="lucide:x" class="size-4" />
          </DialogClose>
        </header>
        <div class="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          <slot />
        </div>
        <footer v-if="$slots.footer" class="border-t border-border px-5 py-3.5">
          <slot name="footer" />
        </footer>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
