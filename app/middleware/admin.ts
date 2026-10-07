/** Protege las rutas del panel: sin sesión → login (conservando a dónde iba). */
export default defineNuxtRouteMiddleware((to) => {
  const auth = useAuthStore()
  if (!auth.loggedIn) {
    return navigateTo({ path: '/admin/login', query: to.fullPath !== '/admin' ? { redirect: to.fullPath } : {} })
  }
})
