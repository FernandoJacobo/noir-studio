export const useUiStore = defineStore('noir-ui', () => {
  const sidebarCollapsed = ref(false)
  const commandOpen = ref(false)
  const mobileNavOpen = ref(false)
  /** Abre el diálogo "Nueva cita" del panel con valores prellenados. */
  const newAppointment = ref<{ open: boolean, date?: string, start?: number, staffId?: string, clientId?: string }>({ open: false })

  function openNewAppointment(prefill: { date?: string, start?: number, staffId?: string, clientId?: string } = {}) {
    newAppointment.value = { open: true, ...prefill }
  }

  return { sidebarCollapsed, commandOpen, mobileNavOpen, newAppointment, openNewAppointment }
}, {
  persist: { pick: ['sidebarCollapsed'] },
})
