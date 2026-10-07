export const useAuthStore = defineStore('noir-auth', () => {
  const user = ref<string | null>(null)
  const loggedIn = computed(() => !!user.value)

  function login(username: string, password: string): boolean {
    const { demo } = useAppConfig()
    if (username.trim().toLowerCase() === demo.adminUser && password === demo.adminPassword) {
      user.value = username.trim().toLowerCase()
      return true
    }
    return false
  }

  function logout() {
    user.value = null
  }

  return { user, loggedIn, login, logout }
}, { persist: true })
