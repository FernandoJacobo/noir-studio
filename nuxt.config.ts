import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import { brand } from './config/brand'

// Incluye en el bundle del cliente todos los iconos Lucide referenciados en el código,
// también los que se resuelven dinámicamente (arrays, datos semilla, app.config).
function collectIcons(dir: string, found = new Set<string>()): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) collectIcons(path, found)
    else if (/\.(vue|ts)$/.test(entry.name)) {
      for (const m of readFileSync(path, 'utf8').matchAll(/lucide:[a-z0-9-]+/g)) found.add(m[0])
    }
  }
  return [...found]
}
const dynamicIcons = collectIcons(fileURLToPath(new URL('./app', import.meta.url)))

export default defineNuxtConfig({
  compatibilityDate: '2026-10-01',
  ssr: false,
  devtools: { enabled: false },

  modules: [
    '@pinia/nuxt',
    'pinia-plugin-persistedstate/nuxt',
    '@nuxtjs/color-mode',
    '@nuxt/icon',
    '@nuxt/fonts',
    '@vueuse/nuxt',
    '@vueuse/motion/nuxt',
    '@nuxt/eslint',
  ],

  css: ['~/assets/css/main.css'],

  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      include: ['date-fns', 'date-fns/locale', 'reka-ui', 'echarts/core', 'echarts/charts', 'echarts/components', 'echarts/renderers', 'vue-echarts', 'zod', 'vue-sonner'],
    },
  },

  components: [
    { path: '~/components', pathPrefix: true },
  ],

  imports: {
    dirs: ['stores'],
  },

  app: {
    head: {
      htmlAttrs: { lang: 'es-MX' },
      title: `${brand.name} — ${brand.slogan}`,
      // Metas en el HTML estático: los crawlers de WhatsApp/Facebook no ejecutan JavaScript.
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'theme-color', content: '#0B0B0C' },
        { name: 'description', content: brand.description },
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: brand.name },
        { property: 'og:locale', content: 'es_MX' },
        { property: 'og:title', content: `${brand.name} — ${brand.slogan}` },
        { property: 'og:description', content: brand.description },
        { property: 'og:url', content: brand.siteUrl },
        { property: 'og:image', content: `${brand.siteUrl}${brand.ogImage}` },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        { property: 'og:image:alt', content: `${brand.name} · ${brand.giro}` },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:image', content: `${brand.siteUrl}${brand.ogImage}` },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32.png' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
        { rel: 'manifest', href: '/site.webmanifest' },
        { rel: 'preconnect', href: 'https://images.unsplash.com', crossorigin: '' },
        { rel: 'preload', as: 'image', href: brand.heroImage, fetchpriority: 'high' },
      ],
    },
  },

  // Pantalla de carga del SPA con el fondo del tema (evita el destello blanco).
  spaLoadingTemplate: true,

  colorMode: {
    preference: 'dark',
    fallback: 'dark',
    classSuffix: '',
    storageKey: 'noir-color-mode',
  },

  piniaPluginPersistedstate: {
    storage: 'localStorage',
  },

  icon: {
    provider: 'none',
    clientBundle: {
      scan: true,
      icons: dynamicIcons,
      sizeLimitKb: 512,
    },
  },

  fonts: {
    families: [
      { name: 'Geist', provider: 'google', weights: [400, 500, 600, 700] },
      { name: 'Instrument Serif', provider: 'google', weights: [400], styles: ['normal', 'italic'] },
    ],
  },

  eslint: {
    config: {
      stylistic: false,
    },
  },

  typescript: {
    strict: true,
    typeCheck: false,
  },

  nitro: {
    preset: 'static',
  },
})
