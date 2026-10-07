<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })
useSeoMeta({ title: 'Clientes', robots: 'noindex' })

const clients = useClientsStore()
const { statsOf } = useClientStats()
const now = useNowTicker()

const search = ref('')
const q = refDebounced(search, 120)
type Sort = 'name' | 'visits' | 'recent'
const sort = ref<Sort>('recent')

const normalize = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

const list = computed(() => {
  const term = normalize(q.value.trim())
  const digits = q.value.replace(/\D/g, '')
  return clients.items
    .filter(c => !term || normalize(`${c.name} ${c.email}`).includes(term) || (digits.length >= 3 && c.phone.includes(digits)))
    .map(c => ({ c, s: statsOf(c) }))
    .sort((x, y) => {
      if (sort.value === 'name') return x.c.name.localeCompare(y.c.name, 'es')
      if (sort.value === 'visits') return y.s.totalVisits - x.s.totalVisits
      return (y.s.last ?? '').localeCompare(x.s.last ?? '') || y.c.createdAt.localeCompare(x.c.createdAt)
    })
})

const isNew = (createdAt: string) => now.value.getTime() - new Date(createdAt).getTime() < 14 * 86_400_000
</script>

<template>
  <div class="mx-auto max-w-7xl space-y-4 p-4 sm:p-6 lg:p-8">
    <header class="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 class="text-2xl font-semibold tracking-tight">
          Clientes
        </h1>
        <p class="mt-1 text-[13px] text-muted">
          {{ pluralize(clients.items.length, 'cliente') }} registrados
        </p>
      </div>
    </header>

    <div class="flex flex-wrap items-center gap-2">
      <UiInput v-model="search" icon="lucide:search" placeholder="Nombre, correo o teléfono" aria-label="Buscar clientes" class="w-full sm:w-72" />
      <UiTabs v-model="sort" size="sm" label="Ordenar por" :items="[{ value: 'recent', label: 'Recientes' }, { value: 'visits', label: 'Más visitas' }, { value: 'name', label: 'A–Z' }]" />
    </div>

    <TransitionGroup v-if="list.length" tag="ul" name="list" class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      <li v-for="{ c, s } in list" :key="c.id">
        <NuxtLink :to="`/admin/clientes/${c.id}`" class="group flex h-full items-start gap-3 surface-card p-4 transition-colors hover:border-border-strong">
          <SharedAvatar :name="c.name" class="size-10" />
          <div class="min-w-0 flex-1">
            <p class="flex items-center gap-2 text-[14px] font-medium">
              <span class="truncate">{{ c.name }}</span>
              <UiBadge v-if="isNew(c.createdAt)" tone="accent">
                Nuevo
              </UiBadge>
              <UiBadge v-else-if="s.totalVisits >= 20" tone="solid">
                VIP
              </UiBadge>
            </p>
            <p class="truncate text-xs text-muted tabular-nums">
              {{ formatPhone(c.phone) }} · {{ c.email }}
            </p>
            <dl class="mt-3 grid grid-cols-3 gap-2 border-t border-border pt-3 text-xs">
              <div>
                <dt class="text-muted">
                  Visitas
                </dt>
                <dd class="font-medium tabular-nums">
                  {{ s.totalVisits }}
                </dd>
              </div>
              <div>
                <dt class="text-muted">
                  Gastado
                </dt>
                <dd class="font-medium tabular-nums">
                  {{ formatCompactPrice(s.spent) }}
                </dd>
              </div>
              <div>
                <dt class="text-muted">
                  Próxima
                </dt>
                <dd class="truncate font-medium tabular-nums">
                  {{ s.next ? formatDateShort(s.next) : '—' }}
                </dd>
              </div>
            </dl>
          </div>
          <Icon name="lucide:chevron-right" class="mt-1 size-4 text-muted transition-transform group-hover:translate-x-0.5" />
        </NuxtLink>
      </li>
    </TransitionGroup>
    <SharedEmptyState v-else icon="lucide:users" title="Sin resultados" :description="`Ningún cliente coincide con “${search}”.`" class="surface-card" />
  </div>
</template>
