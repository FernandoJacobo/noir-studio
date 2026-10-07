/** Normaliza teléfonos mexicanos a 10 dígitos. */
export function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, '').slice(-10)
}

/** Link de WhatsApp con mensaje prellenado. Agrega lada 52 si el número es de 10 dígitos. */
export function whatsappUrl(phone: string | null, message: string): string {
  const text = encodeURIComponent(message)
  if (!phone) return `https://wa.me/?text=${text}`
  const digits = phone.replace(/\D/g, '')
  const full = digits.length === 10 ? `52${digits}` : digits
  return `https://wa.me/${full}?text=${text}`
}

export interface AppointmentMessageData {
  businessName: string
  folio: string
  clientName: string
  services: string[]
  staffName?: string
  dateLabel: string
  timeLabel: string
  total: string
  address: string
  link?: string
}

/**
 * Mensaje de confirmación de cita para WhatsApp (con formato *negritas*).
 * Sin emojis: el redireccionamiento de wa.me corrompe caracteres fuera del BMP.
 */
export function buildAppointmentMessage(d: AppointmentMessageData): string {
  return [
    `Hola, soy ${d.clientName}. Reservé una cita en *${d.businessName}*:`,
    '',
    `Fecha: *${d.dateLabel}*, *${d.timeLabel}*`,
    `Servicio: ${d.services.join(' + ')}`,
    ...(d.staffName ? [`Con: ${d.staffName}`] : []),
    `Total: ${d.total}`,
    `Dirección: ${d.address}`,
    '',
    `Folio: ${d.folio}`,
    ...(d.link ? [d.link] : []),
  ].join('\n')
}
