<script setup lang="ts">
import { TooltipProvider } from 'reka-ui'
import { Toaster } from 'vue-sonner'
import 'vue-sonner/style.css'

const { brand, copy } = useAppConfig()
const settings = useSettingsStore()
const colorMode = useColorMode()

// Color de acento configurable con vista previa en vivo.
watchEffect(() => {
  const root = document.documentElement
  root.style.setProperty('--accent', settings.settings.accent)
  root.style.setProperty('--accent-foreground', readableForeground(settings.settings.accent))
})

// Barra de estado del navegador acorde al tema.
watchEffect(() => {
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', colorMode.value === 'light' ? '#F4F4F3' : '#0B0B0C')
})

const ogImage = `${brand.siteUrl}${brand.ogImage}`

useHead({
  titleTemplate: title => (title ? `${title} · ${brand.name}` : `${brand.name} — ${brand.slogan}`),
})

useSeoMeta({
  description: brand.description,
  ogType: 'website',
  ogSiteName: brand.name,
  ogTitle: `${brand.name} — ${brand.slogan}`,
  ogDescription: copy.heroSubtitle,
  ogImage,
  ogImageWidth: 1200,
  ogImageHeight: 630,
  ogImageAlt: `${brand.name} · ${brand.giro}`,
  ogLocale: 'es_MX',
  ogUrl: brand.siteUrl,
  twitterCard: 'summary_large_image',
  twitterImage: ogImage,
})
</script>

<template>
  <TooltipProvider :delay-duration="300">
    <NuxtLoadingIndicator color="var(--accent)" :height="2" />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <Toaster
      position="bottom-right"
      :theme="colorMode.value === 'light' ? 'light' : 'dark'"
      :toast-options="{
        class: 'noir-toast',
        duration: 4500,
      }"
      close-button
    />
  </TooltipProvider>
</template>

<style>
/* Toasts con la estética del sistema */
[data-sonner-toaster] {
  --normal-bg: var(--surface);
  --normal-border: var(--border);
  --normal-text: var(--foreground);
  --border-radius: 12px;
  font-family: var(--font-sans);
}
[data-sonner-toast].noir-toast {
  box-shadow: inset 0 1px 0 var(--highlight), 0 16px 40px -12px rgb(var(--shadow-color) / 0.4);
  font-size: 13px;
}
[data-sonner-toast] [data-description] {
  color: var(--muted);
}
[data-sonner-toast] [data-button] {
  background: var(--primary);
  color: var(--primary-foreground);
  border-radius: 7px;
  font-weight: 500;
}
[data-sonner-toast] [data-close-button] {
  background: var(--surface);
  border-color: var(--border);
  color: var(--muted);
}
</style>
