import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { AppointmentStatus, ISODate, Minutes } from '~~/types'
import { parseISODate } from './time'

const priceFormatter = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  maximumFractionDigits: 0,
})

/** `350` → `$350` (MXN, sin decimales). */
export function formatPrice(value: number): string {
  return priceFormatter.format(value)
}

export function formatCompactPrice(value: number): string {
  if (Math.abs(value) >= 1000) return `$${(value / 1000).toFixed(value >= 10_000 ? 0 : 1).replace('.0', '')}k`
  return formatPrice(value)
}

/** `75` → `1 h 15 min` */
export function formatDuration(min: Minutes): string {
  const h = Math.floor(min / 60)
  const m = min % 60
  if (!h) return `${m} min`
  if (!m) return `${h} h`
  return `${h} h ${m} min`
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

/** `miércoles 7 de octubre` */
export function formatDateLong(iso: ISODate, withYear = false): string {
  return format(parseISODate(iso), withYear ? 'EEEE d \'de\' MMMM \'de\' yyyy' : 'EEEE d \'de\' MMMM', { locale: es })
}

/** `Mié 7 oct` */
export function formatDateShort(iso: ISODate): string {
  return capitalize(format(parseISODate(iso), 'EEE d MMM', { locale: es }).replace('.', ''))
}

export function formatDateFns(iso: ISODate, pattern: string): string {
  return format(parseISODate(iso), pattern, { locale: es })
}

export function formatMonthYear(date: Date): string {
  return capitalize(format(date, 'MMMM yyyy', { locale: es }))
}

export { capitalize }

/** Iniciales para avatares: "Santiago Ríos" → "SR" */
export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(p => p[0]!.toUpperCase())
    .join('')
}

/** `3312345678` → `33 1234 5678` */
export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '').slice(-10)
  if (digits.length !== 10) return phone
  return `${digits.slice(0, 2)} ${digits.slice(2, 6)} ${digits.slice(6)}`
}

export const STATUS_META: Record<AppointmentStatus, { label: string, icon: string, tone: 'warning' | 'info' | 'success' | 'muted' | 'danger' }> = {
  pending: { label: 'Pendiente', icon: 'lucide:circle-dashed', tone: 'warning' },
  confirmed: { label: 'Confirmada', icon: 'lucide:circle-check', tone: 'info' },
  completed: { label: 'Completada', icon: 'lucide:check-check', tone: 'success' },
  cancelled: { label: 'Cancelada', icon: 'lucide:circle-x', tone: 'muted' },
  no_show: { label: 'No asistió', icon: 'lucide:user-x', tone: 'danger' },
}

export function pluralize(n: number, singular: string, plural = `${singular}s`): string {
  return `${n} ${n === 1 ? singular : plural}`
}

/** Variación porcentual, redondeada; `null` si no hay base de comparación. */
export function percentChange(current: number, previous: number): number | null {
  if (!previous) return current ? null : 0
  return Math.round(((current - previous) / previous) * 100)
}

export const WEEKDAY_LABELS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'] as const
export const WEEKDAY_SHORT = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'] as const
/** Orden de la semana en México: lunes primero. */
export const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0] as const

/** "Hoy", "Mañana" o "Mié 7 oct". */
export function relativeDayLabel(iso: ISODate, today: ISODate): string {
  const d = Math.round((parseISODate(iso).getTime() - parseISODate(today).getTime()) / 86_400_000)
  if (d === 0) return 'Hoy'
  if (d === 1) return 'Mañana'
  if (d === -1) return 'Ayer'
  return formatDateShort(iso)
}
