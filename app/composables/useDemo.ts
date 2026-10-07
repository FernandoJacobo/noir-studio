/** Acciones globales del demo. */
export function useDemo() {
  function reset() {
    const seed = useDemoSeed(true)
    useSettingsStore().reset(seed)
    useServicesStore().reset(seed)
    useStaffStore().reset(seed)
    useClientsStore().reset(seed)
    useAppointmentsStore().reset(seed)
    useBookingStore().reset()
  }
  return { reset }
}
