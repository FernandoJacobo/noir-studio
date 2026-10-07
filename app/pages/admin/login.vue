<script setup lang="ts">
definePageMeta({ layout: 'auth' })
useSeoMeta({ title: 'Acceso al panel', robots: 'noindex' })

const { demo } = useAppConfig()
const auth = useAuthStore()
const route = useRoute()

const redirect = computed(() => (typeof route.query.redirect === 'string' && route.query.redirect.startsWith('/admin') ? route.query.redirect : '/admin'))
if (auth.loggedIn) await navigateTo(redirect.value)

const username = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)
const showPassword = ref(false)

async function submit() {
  error.value = ''
  loading.value = true
  await new Promise(r => setTimeout(r, 500))
  loading.value = false
  if (auth.login(username.value, password.value)) await navigateTo(redirect.value)
  else error.value = 'Usuario o contraseña incorrectos.'
}

function fillDemo() {
  username.value = demo.adminUser
  password.value = demo.adminPassword
}
</script>

<template>
  <div class="stagger">
    <div class="mb-8 flex flex-col items-center text-center" style="--i: 0">
      <NuxtLink to="/" aria-label="Volver al sitio">
        <SharedLogo size="lg" />
      </NuxtLink>
      <h1 class="mt-6 text-2xl font-semibold tracking-tight">
        Panel de administración
      </h1>
      <p class="mt-1 text-sm text-muted">
        Agenda, clientes y configuración del negocio.
      </p>
    </div>

    <form class="surface-elevated space-y-4 p-6" style="--i: 1" @submit.prevent="submit">
      <div class="space-y-1.5">
        <UiLabel for="user">
          Usuario
        </UiLabel>
        <UiInput id="user" v-model="username" icon="lucide:user-round" autocomplete="username" autocapitalize="none" required />
      </div>
      <div class="space-y-1.5">
        <UiLabel for="pass">
          Contraseña
        </UiLabel>
        <div class="relative">
          <UiInput id="pass" v-model="password" :type="showPassword ? 'text' : 'password'" icon="lucide:lock" autocomplete="current-password" required />
          <button type="button" class="absolute right-2 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-md text-muted hover:text-foreground" :aria-label="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'" @click="showPassword = !showPassword">
            <Icon :name="showPassword ? 'lucide:eye-off' : 'lucide:eye'" class="size-4" />
          </button>
        </div>
      </div>
      <Transition name="fade">
        <p v-if="error" class="flex items-center gap-1.5 text-[13px] text-danger" role="alert">
          <Icon name="lucide:circle-alert" class="size-4" />
          {{ error }}
        </p>
      </Transition>
      <UiButton type="submit" size="lg" class="w-full" :loading="loading">
        Entrar
      </UiButton>
    </form>

    <!-- Aviso de entorno de demostración con credenciales visibles -->
    <div class="mt-4 rounded-[12px] border border-dashed border-accent/40 bg-accent/8 p-4 text-[13px]" style="--i: 2">
      <p class="flex items-center gap-2 font-medium text-accent-ink">
        <Icon name="lucide:flask-conical" class="size-4" />
        Entorno de demostración
      </p>
      <p class="mt-1.5 text-muted">
        Los datos son ficticios y viven solo en tu navegador. Usa estas credenciales:
      </p>
      <div class="mt-3 flex items-center justify-between gap-3">
        <dl class="flex gap-4 font-mono text-xs">
          <div><dt class="inline text-muted">usuario </dt><dd class="inline font-semibold">{{ demo.adminUser }}</dd></div>
          <div><dt class="inline text-muted">contraseña </dt><dd class="inline font-semibold">{{ demo.adminPassword }}</dd></div>
        </dl>
        <UiButton size="xs" variant="secondary" @click="fillDemo">
          Autocompletar
        </UiButton>
      </div>
    </div>

    <p class="mt-6 text-center text-xs text-muted" style="--i: 3">
      <NuxtLink to="/" class="inline-flex items-center gap-1 hover:text-foreground">
        <Icon name="lucide:arrow-left" class="size-3.5" />
        Volver al sitio
      </NuxtLink>
    </p>
  </div>
</template>
