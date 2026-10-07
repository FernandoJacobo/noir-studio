/**
 * Genera favicon, íconos PWA e imagen Open Graph a partir de SVG.
 * Uso: node scripts/generate-assets.mjs
 */
import { writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const out = file => fileURLToPath(new URL(`../public/${file}`, import.meta.url))

const BG = '#0B0B0C'
const FG = '#EDEDEF'
const ACCENT = '#C9B38A'
const MUTED = '#8B8B93'

/** Monograma: cuadrado redondeado, diagonal y círculo (igual que components/shared/Logo.vue). */
const mark = (size, { bg = FG, cut = BG, accent = ACCENT } = {}) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 32 32">
  <rect x="1" y="1" width="30" height="30" rx="8" fill="${bg}"/>
  <path d="M9 23 L23 9" stroke="${cut}" stroke-width="2.2" stroke-linecap="round"/>
  <circle cx="20.5" cy="20.5" r="3.2" fill="none" stroke="${accent}" stroke-width="2"/>
  <circle cx="11.5" cy="11.5" r="1.7" fill="${cut}"/>
</svg>`

// Favicon SVG con soporte de modo claro/oscuro
const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <style>.b{fill:#141415}.c{stroke:#F4F4F3}.d{fill:#F4F4F3}@media (prefers-color-scheme:dark){.b{fill:#EDEDEF}.c{stroke:#0B0B0C}.d{fill:#0B0B0C}}</style>
  <rect class="b" x="1" y="1" width="30" height="30" rx="8"/>
  <path class="c" d="M9 23 L23 9" stroke-width="2.2" stroke-linecap="round"/>
  <circle cx="20.5" cy="20.5" r="3.2" fill="none" stroke="${ACCENT}" stroke-width="2"/>
  <circle class="d" cx="11.5" cy="11.5" r="1.7"/>
</svg>
`
await writeFile(out('favicon.svg'), faviconSvg)
await sharp(Buffer.from(mark(32))).png().toFile(out('favicon-32.png'))

// Íconos con fondo sólido (apple-touch y PWA)
const padded = size => `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 100 100">
  <rect width="100" height="100" fill="${BG}"/>
  <g transform="translate(22 22) scale(1.75)">${mark(32).replace(/<\/?svg[^>]*>/g, '')}</g>
</svg>`
await sharp(Buffer.from(padded(180))).png().toFile(out('apple-touch-icon.png'))
await sharp(Buffer.from(padded(192))).png().toFile(out('icon-192.png'))
await sharp(Buffer.from(padded(512))).png().toFile(out('icon-512.png'))

// Imagen Open Graph 1200×630
const grid = Array.from({ length: 22 }, (_, i) => `<path d="M${i * 56} 0V630" stroke="#fff" stroke-opacity=".05"/>`).join('')
  + Array.from({ length: 12 }, (_, i) => `<path d="M0 ${i * 56}H1200" stroke="#fff" stroke-opacity=".05"/>`).join('')

const og = `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <radialGradient id="glow" cx="78%" cy="0%" r="70%">
      <stop offset="0" stop-color="${ACCENT}" stop-opacity=".22"/>
      <stop offset="1" stop-color="${ACCENT}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="fade" cx="50%" cy="35%" r="75%">
      <stop offset=".3" stop-color="#000" stop-opacity="0"/>
      <stop offset="1" stop-color="${BG}" stop-opacity="1"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="630" fill="${BG}"/>
  ${grid}
  <rect width="1200" height="630" fill="url(#fade)"/>
  <rect width="1200" height="630" fill="url(#glow)"/>

  <g transform="translate(80 84) scale(2)">${mark(32).replace(/<\/?svg[^>]*>/g, '')}</g>
  <text x="168" y="133" font-family="Segoe UI, Helvetica, Arial, sans-serif" font-size="30" font-weight="600" letter-spacing="7" fill="${FG}">NOIR</text>
  <text x="283" y="133" font-family="Georgia, 'Times New Roman', serif" font-style="italic" font-size="30" fill="${MUTED}">Studio</text>

  <text x="80" y="330" font-family="Segoe UI, Helvetica, Arial, sans-serif" font-size="96" font-weight="600" letter-spacing="-4" fill="${FG}">Tu estilo,</text>
  <text x="80" y="430" font-family="Georgia, 'Times New Roman', serif" font-style="italic" font-size="104" fill="${ACCENT}">a tu hora.</text>

  <text x="80" y="540" font-family="Segoe UI, Helvetica, Arial, sans-serif" font-size="26" fill="${MUTED}">Barbería &amp; grooming premium · Guadalajara · Reserva en línea en menos de un minuto</text>

  <g transform="translate(860 120)">
    <rect width="260" height="150" rx="18" fill="#141415" stroke="#26262A"/>
    <text x="24" y="44" font-family="Segoe UI, Helvetica, Arial, sans-serif" font-size="16" fill="${MUTED}">Próximo horario</text>
    <text x="24" y="86" font-family="Segoe UI, Helvetica, Arial, sans-serif" font-size="32" font-weight="600" fill="${FG}">Hoy · 4:30 p. m.</text>
    <circle cx="30" cy="118" r="6" fill="#86B596"/>
    <text x="46" y="124" font-family="Segoe UI, Helvetica, Arial, sans-serif" font-size="16" fill="${MUTED}">Disponible ahora</text>
  </g>
</svg>`
await sharp(Buffer.from(og)).png({ compressionLevel: 9 }).toFile(out('og.png'))

console.log('✔ Assets generados en public/')
