import type { Client } from '~~/types'

export const useClientsStore = defineStore('noir-clients', () => {
  const items = ref<Client[]>(structuredClone(useDemoSeed().clients))

  const byId = computed(() => new Map(items.value.map(c => [c.id, c])))

  function get(id: string) {
    return byId.value.get(id)
  }

  /** Busca por teléfono (10 dígitos) y crea o actualiza al cliente. */
  function upsert(data: { name: string, phone: string, email: string, notes?: string }): Client {
    const phone = normalizePhone(data.phone)
    const existing = items.value.find(c => normalizePhone(c.phone) === phone)
    if (existing) {
      existing.name = data.name.trim() || existing.name
      existing.email = data.email.trim() || existing.email
      return existing
    }
    const client: Client = {
      id: createId('cli'),
      name: data.name.trim(),
      phone,
      email: data.email.trim(),
      notes: data.notes?.trim() ?? '',
      baseVisits: 0,
      createdAt: new Date().toISOString(),
    }
    items.value.push(client)
    return client
  }

  function update(id: string, patch: Partial<Client>) {
    const i = items.value.findIndex(c => c.id === id)
    if (i !== -1) items.value[i] = { ...items.value[i]!, ...patch, id }
  }

  function reset(seed = useDemoSeed()) {
    items.value = structuredClone(seed.clients)
  }

  return { items, byId, get, upsert, update, reset }
}, { persist: true })
