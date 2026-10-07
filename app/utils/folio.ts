const FOLIO_ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ' // sin 0/O/1/I para dictarlo por teléfono

/** Folio legible: `NS-7K2Q9F` */
export function generateFolio(prefix: string, random: () => number = Math.random): string {
  let code = ''
  for (let i = 0; i < 6; i++) code += FOLIO_ALPHABET[Math.floor(random() * FOLIO_ALPHABET.length)]
  return `${prefix}-${code}`
}

export function createId(prefix = 'id', random: () => number = Math.random): string {
  return `${prefix}_${Math.floor(random() * 36 ** 8).toString(36).padStart(8, '0')}`
}
