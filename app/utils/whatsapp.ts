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
