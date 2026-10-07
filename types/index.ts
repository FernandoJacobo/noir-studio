/** Fecha local en formato `yyyy-MM-dd`. */
export type ISODate = string

/** Minutos desde la medianoche (0–1440). */
export type Minutes = number

/** 0 = domingo … 6 = sábado (igual que `Date#getDay`). */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6

export interface TimeRange {
  start: Minutes
  end: Minutes
}

/** Horario de un día: `null` = cerrado / descanso. Puede tener varios bloques (p. ej. comida). */
export type DaySchedule = TimeRange[] | null

export type WeeklySchedule = Record<Weekday, DaySchedule>

export type ServiceCategory = 'Corte' | 'Barba' | 'Combos' | 'Tratamientos' | (string & {})

export interface Service {
  id: string
  name: string
  description: string
  duration: Minutes
  price: number
  category: ServiceCategory
  image?: string
  active: boolean
  popular?: boolean
}

export interface StaffMember {
  id: string
  name: string
  role: string
  bio: string
  photo?: string
  specialties: string[]
  serviceIds: string[]
  schedule: WeeklySchedule
  daysOff: ISODate[]
  active: boolean
  instagram?: string
}

export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'

export type AppointmentSource = 'online' | 'admin' | 'walk_in'

export interface Appointment {
  id: string
  folio: string
  clientId: string
  staffId: string
  serviceIds: string[]
  date: ISODate
  start: Minutes
  /** Duración total en minutos (suma de servicios). */
  duration: Minutes
  /** Precio total congelado al momento de reservar. */
  price: number
  status: AppointmentStatus
  notes?: string
  source: AppointmentSource
  createdAt: string
  updatedAt: string
}

export interface Client {
  id: string
  name: string
  phone: string
  email: string
  notes: string
  /** Visitas previas al historial registrado en el sistema. */
  baseVisits: number
  createdAt: string
}

export interface Testimonial {
  name: string
  text: string
  rating: number
  service: string
}

export interface BusinessSettings {
  name: string
  phone: string
  whatsapp: string
  email: string
  address: string
  hours: WeeklySchedule
  /** Intervalo de la cuadrícula de horarios. */
  slotInterval: number
  /** Margen de limpieza entre citas. */
  bufferMinutes: number
  /** Anticipación mínima para reservar en línea (minutos). */
  minAdvanceMinutes: number
  /** Cuántos días hacia adelante se puede reservar. */
  maxDaysAhead: number
  accent: string
}

export interface Slot {
  start: Minutes
  /** Profesionales que pueden atender ese horario. */
  staffIds: string[]
}

/** Columna de la agenda (vista día = profesional, vista semana = día). */
export interface AgendaColumn {
  key: string
  date: ISODate
  /** En la vista día cada columna es un profesional. */
  staffId?: string
  label: string
  sublabel?: string
  photo?: string
  isToday?: boolean
  /** Horario laboral de la columna (lo demás se sombrea). */
  ranges: TimeRange[]
}
