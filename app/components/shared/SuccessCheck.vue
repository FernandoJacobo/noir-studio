<template>
  <div class="relative grid size-20 place-items-center" aria-hidden="true">
    <span class="absolute inset-0 rounded-full bg-success/15 motion-safe:animate-[ping_1.4s_ease-out_1]" />
    <span class="absolute inset-2 rounded-full border border-success/30 bg-success/10" />
    <svg viewBox="0 0 52 52" class="relative size-12 text-success">
      <circle cx="26" cy="26" r="23" fill="none" stroke="currentColor" stroke-width="2" class="check-circle" />
      <path d="M15 27 l7 7 l15 -16" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="check-mark" />
    </svg>
  </div>
</template>

<style scoped>
.check-circle {
  stroke-dasharray: 150;
  stroke-dashoffset: 150;
  animation: draw 0.6s var(--ease-out-soft) forwards;
}
.check-mark {
  stroke-dasharray: 40;
  stroke-dashoffset: 40;
  animation: draw 0.4s 0.45s var(--ease-out-soft) forwards;
}
@keyframes draw {
  to { stroke-dashoffset: 0; }
}
@media (prefers-reduced-motion: reduce) {
  .check-circle, .check-mark { stroke-dashoffset: 0; animation: none; }
}
</style>
