import type { ISODate, Minutes, Weekday } from '~~/types'

const pad = (n: number) => String(n).padStart(2, '0')

/** `Date` → `yyyy-MM-dd` usando la hora local. */
export function toISODate(date: Date): ISODate {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

/** `yyyy-MM-dd` → `Date` a medianoche local. */
export function parseISODate(iso: ISODate): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y!, (m ?? 1) - 1, d ?? 1)
}

export function addDaysISO(iso: ISODate, days: number): ISODate {
  const d = parseISODate(iso)
  d.setDate(d.getDate() + days)
  return toISODate(d)
}

export function diffDaysISO(a: ISODate, b: ISODate): number {
  return Math.round((parseISODate(a).getTime() - parseISODate(b).getTime()) / 86_400_000)
}

export function weekdayOf(iso: ISODate): Weekday {
  return parseISODate(iso).getDay() as Weekday
}

/** Minutos transcurridos del día para una fecha dada. */
export function minutesOfDay(date: Date): Minutes {
  return date.getHours() * 60 + date.getMinutes()
}

/** `"10:30"` → 630 */
export function hhmmToMinutes(value: string): Minutes {
  const [h, m] = value.split(':').map(Number)
  return (h ?? 0) * 60 + (m ?? 0)
}

/** 630 → `"10:30"` */
export function minutesToHHMM(min: Minutes): string {
  return `${pad(Math.floor(min / 60))}:${pad(min % 60)}`
}

const NBSP = ' '

/**
 * Formato de 12 h de México: `10:30 a. m.`, `4:00 p. m.`.
 * Usa espacios de no separación para que la hora nunca se parta en dos líneas.
 */
export function formatTime(min: Minutes, opts: { compact?: boolean } = {}): string {
  const total = ((min % 1440) + 1440) % 1440
  const h24 = Math.floor(total / 60)
  const m = total % 60
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12
  const suffix = h24 < 12 ? `a.${NBSP}m.` : `p.${NBSP}m.`
  if (opts.compact && m === 0) return `${h12}${NBSP}${suffix}`
  return `${h12}:${pad(m)}${NBSP}${suffix}`
}

export function formatTimeRange(start: Minutes, duration: Minutes): string {
  return `${formatTime(start)} – ${formatTime(start + duration)}`
}

/** Combina fecha ISO + minutos en un `Date` local. */
export function toDateTime(iso: ISODate, min: Minutes): Date {
  const d = parseISODate(iso)
  d.setMinutes(min)
  return d
}

/** Lunes de la semana que contiene `iso` (semana inicia en lunes, como en México). */
export function startOfWeekISO(iso: ISODate): ISODate {
  const day = weekdayOf(iso)
  const offset = day === 0 ? -6 : 1 - day
  return addDaysISO(iso, offset)
}

export function rangesOverlap(aStart: number, aEnd: number, bStart: number, bEnd: number): boolean {
  return aStart < bEnd && bStart < aEnd
}
