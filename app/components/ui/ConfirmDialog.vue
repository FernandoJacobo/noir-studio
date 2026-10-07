<script setup lang="ts">
withDefaults(defineProps<{
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  destructive?: boolean
}>(), { confirmLabel: 'Confirmar', cancelLabel: 'Cancelar' })

const emit = defineEmits<{ confirm: [] }>()
const open = defineModel<boolean>('open', { default: false })

function confirm() {
  emit('confirm')
  open.value = false
}
</script>

<template>
  <UiDialog v-model:open="open" :title="title" size="sm" hide-title>
    <div class="flex gap-4 pt-1">
      <div :class="cn('grid size-10 shrink-0 place-items-center rounded-full border', destructive ? 'border-danger/25 bg-danger/10 text-danger' : 'border-border bg-surface-2 text-foreground')">
        <Icon :name="destructive ? 'lucide:triangle-alert' : 'lucide:circle-help'" class="size-5" />
      </div>
      <div>
        <p class="text-[15px] font-semibold tracking-tight">
          {{ title }}
        </p>
        <p class="mt-1 text-[13px] leading-relaxed text-muted">
          {{ description }}
        </p>
      </div>
    </div>
    <template #footer>
      <UiButton variant="outline" @click="open = false">
        {{ cancelLabel }}
      </UiButton>
      <UiButton :variant="destructive ? 'danger' : 'primary'" @click="confirm">
        {{ confirmLabel }}
      </UiButton>
    </template>
  </UiDialog>
</template>
