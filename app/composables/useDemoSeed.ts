import type { WeeklySchedule } from '~~/types'
import { createSeed, type DemoSeed } from '~/data'

let cached: DemoSeed | null = null

/** Estado inicial del demo (se calcula una sola vez por carga, relativo a la fecha actual). */
export function useDemoSeed(fresh = false): DemoSeed {
  if (cached && !fresh) return cached
  const config = useAppConfig()
  cached = createSeed(new Date(), {
    brand: config.brand,
    businessHours: config.businessHours as unknown as WeeklySchedule,
    booking: config.booking,
  })
  return cached
}
