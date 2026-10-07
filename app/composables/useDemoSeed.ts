import type { WeeklySchedule } from '~~/types'
import { createSeed, type DemoSeed } from '~/data'

let cached: DemoSeed | null = null

/** Estado inicial del demo (se calcula una sola vez por carga, relativo a la fecha actual). */
export function useDemoSeed(fresh = false): DemoSeed {
  if (cached && !fresh) return cached
  // app.config es reactivo (proxy): se pasa una copia plana para poder clonarla.
  const config = JSON.parse(JSON.stringify(useAppConfig())) as ReturnType<typeof useAppConfig>
  cached = createSeed(new Date(), {
    brand: config.brand,
    businessHours: config.businessHours as unknown as WeeklySchedule,
    booking: config.booking,
  })
  return cached
}
