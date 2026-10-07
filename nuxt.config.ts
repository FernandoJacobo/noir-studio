import tailwindcss from '@tailwindcss/vite'

// Iconos que se resuelven de forma dinámica (no los detecta el escáner estático).
const dynamicIcons = [
  'lucide:scissors', 'lucide:sparkles', 'lucide:layers', 'lucide:droplets',
  'lucide:circle-dashed', 'lucide:circle-check', 'lucide:check-check', 'lucide:circle-x', 'lucide:user-x',
  'lucide:layout-dashboard', 'lucide:calendar-days', 'lucide:list-checks', 'lucide:users',
  'lucide:briefcase', 'lucide:user-round', 'lucide:settings', 'lucide:sun', 'lucide:moon', 'lucide:monitor',
  'lucide:instagram', 'lucide:facebook', 'lucide:music-2', 'lucide:message-circle',
  'lucide:calendar-plus', 'lucide:rotate-ccw', 'lucide:log-out', 'lucide:globe',
  'lucide:trending-up', 'lucide:trending-down', 'lucide:wallet', 'lucide:gauge', 'lucide:user-plus',
]

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
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'theme-color', content: '#0B0B0C' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32.png' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
        { rel: 'manifest', href: '/site.webmanifest' },
        { rel: 'preconnect', href: 'https://images.unsplash.com' },
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
