/** ¿El foco está en un campo de texto? (para no robar teclas al escribir) */
export function isTypingTarget(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null
  if (!el) return false
  return el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName)
}

/**
 * Atajos globales del panel:
 * - Ctrl/⌘ + K: paleta de comandos
 * - N: nueva cita
 * - G y luego una tecla: navegar (G D dashboard, G A agenda…)
 */
export function useShortcuts() {
  const ui = useUiStore()
  const router = useRouter()
  const { items } = useAdminNav()
  let pendingG = false
  let gTimer: ReturnType<typeof setTimeout> | undefined

  useEventListener('keydown', (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault()
      ui.commandOpen = !ui.commandOpen
      return
    }
    if (e.metaKey || e.ctrlKey || e.altKey || isTypingTarget(e.target) || ui.commandOpen) return
    if (document.querySelector('[role=dialog]')) return

    const key = e.key.toLowerCase()
    if (pendingG) {
      pendingG = false
      clearTimeout(gTimer)
      const item = items.find(i => i.key === key)
      if (item) {
        e.preventDefault()
        router.push(item.to)
      }
      return
    }
    if (key === 'g') {
      pendingG = true
      gTimer = setTimeout(() => (pendingG = false), 900)
    }
    else if (key === 'n') {
      e.preventDefault()
      ui.openNewAppointment()
    }
    else if (key === '/') {
      e.preventDefault()
      ui.commandOpen = true
    }
  })

  const isMac = computed(() => import.meta.client && /Mac|iPhone|iPad/.test(navigator.platform))
  const modKey = computed(() => (isMac.value ? '⌘' : 'Ctrl'))

  return { modKey }
}
