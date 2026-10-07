import type { ISODate, Minutes } from '~~/types'
import { minutesToHHMM } from './time'

export interface CalendarEvent {
  uid: string
  title: string
  description: string
  location: string
  date: ISODate
  start: Minutes
  duration: Minutes
  /** Zona horaria IANA del negocio, p. ej. `America/Mexico_City`. */
  timezone: string
  /** Desfase UTC fijo de esa zona en formato `-0600` (México ya no usa horario de verano). */
  utcOffset: string
  organizerName?: string
  organizerEmail?: string
}

/** `2026-10-07` + 990 → `20261007T163000` (hora local del negocio). */
export function toICSLocal(date: ISODate, min: Minutes): string {
  const dayOverflow = Math.floor(min / 1440)
  let d = date
  if (dayOverflow) {
    const dt = new Date(`${date}T00:00:00`)
    dt.setDate(dt.getDate() + dayOverflow)
    d = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`
  }
  return `${d.replace(/-/g, '')}T${minutesToHHMM(min % 1440).replace(':', '')}00`
}

/** Marca de tiempo UTC: `20261007T163000Z` */
export function toICSUtc(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
}

/** Escapa texto según RFC 5545 §3.3.11. */
export function escapeICSText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n')
}

/** Pliega líneas a 75 octetos (RFC 5545 §3.1), respetando caracteres multibyte. */
export function foldICSLine(line: string): string {
  const encoder = new TextEncoder()
  if (encoder.encode(line).length <= 75) return line
  const parts: string[] = []
  let current = ''
  let currentBytes = 0
  for (const char of line) {
    const bytes = encoder.encode(char).length
    const limit = parts.length === 0 ? 75 : 74 // las continuaciones empiezan con un espacio
    if (currentBytes + bytes > limit) {
      parts.push(current)
      current = ''
      currentBytes = 0
    }
    current += char
    currentBytes += bytes
  }
  parts.push(current)
  return parts.join('\r\n ')
}

/** Genera un archivo .ics válido para Google Calendar, Apple Calendar y Outlook. */
export function buildICS(event: CalendarEvent, now: Date = new Date()): string {
  const offset = event.utcOffset
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//JacoboDev//Demo Citas//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VTIMEZONE',
    `TZID:${event.timezone}`,
    'BEGIN:STANDARD',
    'DTSTART:19700101T000000',
    `TZOFFSETFROM:${offset}`,
    `TZOFFSETTO:${offset}`,
    'END:STANDARD',
    'END:VTIMEZONE',
    'BEGIN:VEVENT',
    `UID:${event.uid}`,
    `DTSTAMP:${toICSUtc(now)}`,
    `DTSTART;TZID=${event.timezone}:${toICSLocal(event.date, event.start)}`,
    `DTEND;TZID=${event.timezone}:${toICSLocal(event.date, event.start + event.duration)}`,
    `SUMMARY:${escapeICSText(event.title)}`,
    `DESCRIPTION:${escapeICSText(event.description)}`,
    `LOCATION:${escapeICSText(event.location)}`,
    ...(event.organizerEmail ? [`ORGANIZER;CN=${escapeICSText(event.organizerName ?? '')}:mailto:${event.organizerEmail}`] : []),
    'STATUS:CONFIRMED',
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    'DESCRIPTION:Recordatorio de tu cita',
    'TRIGGER:-PT1H',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ]
  return `${lines.map(foldICSLine).join('\r\n')}\r\n`
}

/** Link "Agregar a Google Calendar" con parámetros prellenados. */
export function googleCalendarUrl(event: CalendarEvent): string {
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${toICSLocal(event.date, event.start)}/${toICSLocal(event.date, event.start + event.duration)}`,
    ctz: event.timezone,
    details: event.description,
    location: event.location,
  })
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

/** Dispara la descarga del .ics en el navegador. */
export function downloadICS(filename: string, content: string): void {
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename.endsWith('.ics') ? filename : `${filename}.ics`
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
