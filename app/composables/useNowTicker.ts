/** Fecha "ahora" compartida que se actualiza cada 30 s (agenda, horarios, estado abierto/cerrado). */
export const useNowTicker = createSharedComposable(() =>
  useNow({ scheduler: cb => useIntervalFn(cb, 30_000) }),
)
