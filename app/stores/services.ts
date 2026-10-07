import type { Service } from '~~/types'

export const useServicesStore = defineStore('noir-services', () => {
  const items = ref<Service[]>(structuredClone(useDemoSeed().services))

  const active = computed(() => items.value.filter(s => s.active))
  const byId = computed(() => new Map(items.value.map(s => [s.id, s])))

  function get(id: string) {
    return byId.value.get(id)
  }

  /** Servicios a partir de una lista de ids (ignora ids inexistentes). */
  function resolve(ids: string[]): Service[] {
    return ids.map(id => byId.value.get(id)).filter((s): s is Service => !!s)
  }

  function totals(ids: string[]) {
    const list = resolve(ids)
    return {
      duration: list.reduce((s, x) => s + x.duration, 0),
      price: list.reduce((s, x) => s + x.price, 0),
    }
  }

  function create(data: Omit<Service, 'id'>) {
    const service: Service = { ...data, id: createId('srv') }
    items.value.push(service)
    return service
  }

  function update(id: string, patch: Partial<Service>) {
    const i = items.value.findIndex(s => s.id === id)
    if (i !== -1) items.value[i] = { ...items.value[i]!, ...patch, id }
  }

  function remove(id: string) {
    items.value = items.value.filter(s => s.id !== id)
  }

  function reset(seed = useDemoSeed()) {
    items.value = structuredClone(seed.services)
  }

  return { items, active, byId, get, resolve, totals, create, update, remove, reset }
}, { persist: true })
