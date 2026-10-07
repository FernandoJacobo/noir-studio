type Preference = 'light' | 'dark' | 'system'

/** Cambio de tema con View Transitions API (revelado circular) cuando el navegador lo soporta. */
export function useTheme() {
  const colorMode = useColorMode()
  const isDark = computed(() => colorMode.value === 'dark')

  async function setPreference(pref: Preference, origin?: { x: number, y: number }) {
    const apply = async () => {
      colorMode.preference = pref
      await nextTick()
    }

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!document.startViewTransition || reduceMotion) {
      await apply()
      return
    }

    const x = origin?.x ?? window.innerWidth / 2
    const y = origin?.y ?? 0
    const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y))
    const transition = document.startViewTransition(apply)
    await transition.ready
    document.documentElement.animate(
      { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
      { duration: 420, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', pseudoElement: '::view-transition-new(root)' },
    )
  }

  function toggle(event?: MouseEvent) {
    const origin = event ? { x: event.clientX, y: event.clientY } : undefined
    return setPreference(isDark.value ? 'light' : 'dark', origin)
  }

  return { colorMode, isDark, setPreference, toggle }
}
