/**
 * Identidad de la marca. Fuente única: la consumen `app.config.ts` (componentes)
 * y `nuxt.config.ts` (metas SEO/Open Graph en el HTML estático, que leen WhatsApp y Facebook).
 */
export const brand = {
  name: 'NOIR Studio',
  /** Wordmark: parte principal + sufijo opcional. */
  wordmark: 'NOIR',
  wordmarkSuffix: 'Studio',
  slogan: 'Tu estilo, a tu hora.',
  giro: 'Barbería & grooming premium',
  description: 'Barbería y grooming premium en Guadalajara. Cortes de precisión, barba con toalla caliente y rituales de cuidado. Reserva en línea en menos de un minuto.',
  city: 'Guadalajara',
  address: 'Av. Chapultepec Sur 215, Col. Americana, 44160 Guadalajara, Jal.',
  addressShort: 'Av. Chapultepec Sur 215, Col. Americana',
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Av.+Chapultepec+Sur+215,+Americana,+Guadalajara,+Jal.',
  phone: '3312345678',
  whatsapp: '3312345678',
  email: 'reservas@noirstudio.demo',
  social: [
    { label: 'Instagram', icon: 'lucide:instagram', href: 'https://instagram.com' },
    { label: 'Facebook', icon: 'lucide:facebook', href: 'https://facebook.com' },
    { label: 'TikTok', icon: 'lucide:music-2', href: 'https://tiktok.com' },
  ],
  timezone: 'America/Mexico_City',
  /** Guadalajara no aplica horario de verano desde 2022. */
  utcOffset: '-0600',
  folioPrefix: 'NS',
  siteUrl: 'https://noir-studio.pages.dev',
  ogImage: '/og.png',
  /** Imagen principal del hero (se precarga en el HTML para mejorar el LCP). */
  heroImage: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=720&q=65',
}
