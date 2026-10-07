import type { Appointment, BusinessSettings, Client, Service, StaffMember, WeeklySchedule } from '~~/types'
import { createSeedAppointments } from './appointments'
import { createSeedClients } from './clients'
import { seedServices } from './services'
import { seedStaff } from './staff'

export interface SeedConfig {
  brand: { name: string, phone: string, whatsapp: string, email: string, address: string, folioPrefix: string }
  businessHours: WeeklySchedule
  booking: { slotInterval: number, bufferMinutes: number, minAdvanceMinutes: number, maxDaysAhead: number, accent: string }
}

export interface DemoSeed {
  services: Service[]
  staff: StaffMember[]
  clients: Client[]
  appointments: Appointment[]
  settings: BusinessSettings
}

const clone = <T>(v: T): T => structuredClone(v)

/** Construye el estado inicial completo del demo, con fechas relativas a `now`. */
export function createSeed(now: Date, config: SeedConfig): DemoSeed {
  const services = clone(seedServices)
  const staff = clone(seedStaff)
  const clients = createSeedClients(now)
  const hours = clone(config.businessHours)
  const appointments = createSeedAppointments(now, { services, staff, clients, hours, folioPrefix: config.brand.folioPrefix })

  return {
    services,
    staff,
    clients,
    appointments,
    settings: {
      name: config.brand.name,
      phone: config.brand.phone,
      whatsapp: config.brand.whatsapp,
      email: config.brand.email,
      address: config.brand.address,
      hours,
      slotInterval: config.booking.slotInterval,
      bufferMinutes: config.booking.bufferMinutes,
      minAdvanceMinutes: config.booking.minAdvanceMinutes,
      maxDaysAhead: config.booking.maxDaysAhead,
      accent: config.booking.accent,
    },
  }
}
