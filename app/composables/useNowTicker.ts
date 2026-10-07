/** Fecha "ahora" compartida que se actualiza cada 30 s (agenda, horarios, estado abierto/cerrado). */
export const useNowTicker = createSharedComposable(() => useNow({ interval: 30_000 }))
