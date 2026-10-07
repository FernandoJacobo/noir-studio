import type { StaffMember } from '~~/types'

export const useStaffStore = defineStore('noir-staff', () => {
  const items = ref<StaffMember[]>(structuredClone(useDemoSeed().staff))

  const active = computed(() => items.value.filter(s => s.active))
  const byId = computed(() => new Map(items.value.map(s => [s.id, s])))

  function get(id: string) {
    return byId.value.get(id)
  }

  /** Profesionales activos que pueden realizar todos los servicios indicados. */
  function capableOf(serviceIds: string[]) {
    return active.value.filter(m => canPerformAll(m, serviceIds))
  }

  function create(data: Omit<StaffMember, 'id'>) {
    const member: StaffMember = { ...data, id: createId('stf') }
    items.value.push(member)
    return member
  }

  function update(id: string, patch: Partial<StaffMember>) {
    const i = items.value.findIndex(s => s.id === id)
    if (i !== -1) items.value[i] = { ...items.value[i]!, ...patch, id }
  }

  function remove(id: string) {
    items.value = items.value.filter(s => s.id !== id)
  }

  function reset(seed = useDemoSeed()) {
    items.value = structuredClone(seed.staff)
  }

  return { items, active, byId, get, capableOf, create, update, remove, reset }
}, { persist: true })
