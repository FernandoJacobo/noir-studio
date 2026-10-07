import { describe, expect, it } from 'vitest'
import { buildICS, escapeICSText, foldICSLine, googleCalendarUrl, toICSLocal, type CalendarEvent } from '~/utils/ics'
import { formatDuration, formatPhone, formatPrice, initials, percentChange } from '~/utils/format'
import { formatTime, hhmmToMinutes, minutesToHHMM, startOfWeekISO, addDaysISO } from '~/utils/time'
import { generateFolio } from '~/utils/folio'
import { createRandom, readableForeground } from '~/utils/misc'
import { whatsappUrl } from '~/utils/whatsapp'

const event: CalendarEvent = {
  uid: 'apt_123@noirstudio.demo',
  title: 'Corte clásico · NOIR Studio',
  description: 'Folio NS-7K2Q9F\nCon Santiago Ríos; total $320, pago en sucursal',
  location: 'Av. Principal 123, Col. Centro, Guadalajara',
  date: '2026-10-07',
  start: 16 * 60 + 30,
  duration: 45,
  timezone: 'America/Mexico_City',
  utcOffset: '-0600',
}

describe('ics', () => {
  const ics = buildICS(event, new Date(Date.UTC(2026, 9, 1, 12, 0, 0)))
  const unfolded = ics.replace(/\r\n /g, '')

  it('usa CRLF y cierra con salto de línea', () => {
    expect(ics.split('\r\n').length).toBeGreaterThan(10)
    expect(ics.replace(/\r\n/g, '')).not.toContain('\n')
    expect(ics.endsWith('\r\n')).toBe(true)
  })

  it('incluye la estructura requerida por Google Calendar y Outlook', () => {
    expect(unfolded).toMatch(/^BEGIN:VCALENDAR\r\nVERSION:2\.0\r\nPRODID:/)
    expect(unfolded).toContain('BEGIN:VTIMEZONE\r\nTZID:America/Mexico_City')
    expect(unfolded).toContain('UID:apt_123@noirstudio.demo')
    expect(unfolded).toContain('DTSTAMP:20261001T120000Z')
    expect(unfolded).toContain('DTSTART;TZID=America/Mexico_City:20261007T163000')
    expect(unfolded).toContain('DTEND;TZID=America/Mexico_City:20261007T171500')
    expect(unfolded.trim().endsWith('END:VCALENDAR')).toBe(true)
  })

  it('escapa comas, punto y coma y saltos de línea', () => {
    expect(escapeICSText('a,b;c\\d\ne')).toBe('a\\,b\\;c\\\\d\\ne')
    expect(unfolded).toContain('DESCRIPTION:Folio NS-7K2Q9F\\nCon Santiago Ríos\\; total $320\\, pago en sucursal')
  })

  it('pliega líneas largas a 75 octetos sin romper caracteres multibyte', () => {
    const line = `DESCRIPTION:${'ñ'.repeat(80)}`
    const folded = foldICSLine(line)
    const encoder = new TextEncoder()
    for (const part of folded.split('\r\n')) expect(encoder.encode(part).length).toBeLessThanOrEqual(75)
    expect(folded.replace(/\r\n /g, '')).toBe(line)
  })

  it('maneja citas que cruzan la medianoche', () => {
    expect(toICSLocal('2026-12-31', 24 * 60 + 30)).toBe('20270101T003000')
  })

  it('genera el link de Google Calendar con zona horaria', () => {
    const url = new URL(googleCalendarUrl(event))
    expect(url.searchParams.get('dates')).toBe('20261007T163000/20261007T171500')
    expect(url.searchParams.get('ctz')).toBe('America/Mexico_City')
    expect(url.searchParams.get('action')).toBe('TEMPLATE')
  })
})

describe('formato', () => {
  it('hora en formato de 12 h de México', () => {
    expect(formatTime(10 * 60 + 30)).toBe('10:30 a. m.')
    expect(formatTime(16 * 60 + 30)).toBe('4:30 p. m.')
    expect(formatTime(12 * 60)).toBe('12:00 p. m.')
    expect(formatTime(0)).toBe('12:00 a. m.')
    expect(formatTime(20 * 60, { compact: true })).toBe('8 p. m.')
  })

  it('precios en MXN sin decimales', () => {
    expect(formatPrice(350)).toBe('$350')
    expect(formatPrice(1250)).toBe('$1,250')
  })

  it('duraciones legibles', () => {
    expect(formatDuration(45)).toBe('45 min')
    expect(formatDuration(60)).toBe('1 h')
    expect(formatDuration(75)).toBe('1 h 15 min')
  })

  it('utilidades varias', () => {
    expect(initials('Santiago Ríos Pérez')).toBe('SR')
    expect(formatPhone('+52 33 1234 5678')).toBe('33 1234 5678')
    expect(percentChange(120, 100)).toBe(20)
    expect(percentChange(5, 0)).toBeNull()
    expect(hhmmToMinutes('09:45')).toBe(585)
    expect(minutesToHHMM(585)).toBe('09:45')
    expect(startOfWeekISO('2026-10-11')).toBe('2026-10-05') // domingo → lunes anterior
    expect(addDaysISO('2026-10-31', 1)).toBe('2026-11-01')
  })

  it('folios legibles y deterministas con semilla', () => {
    const a = generateFolio('NS', createRandom(1))
    const b = generateFolio('NS', createRandom(1))
    expect(a).toBe(b)
    expect(a).toMatch(/^NS-[2-9A-HJ-NP-Z]{6}$/)
  })

  it('contraste del acento', () => {
    expect(readableForeground('#C9B38A')).toBe('#0B0B0C')
    expect(readableForeground('#1E3A8A')).toBe('#F4F4F3')
  })

  it('link de WhatsApp con lada de México', () => {
    expect(whatsappUrl('33 1234 5678', 'Hola')).toBe('https://wa.me/523312345678?text=Hola')
    expect(whatsappUrl(null, 'Hola mundo')).toBe('https://wa.me/?text=Hola%20mundo')
  })
})
