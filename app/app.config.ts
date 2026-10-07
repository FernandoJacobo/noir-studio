/**
 * Marca y configuración del demo.
 *
 * Para adaptar el demo a otro giro (consultorio, salón, estudio de tatuajes…)
 * basta con editar `config/brand.ts`, este archivo y los datos semilla de `app/data/`.
 * Los componentes no contienen textos de la marca.
 */
import { brand } from '../config/brand'

const h = (hh: number, mm = 0) => hh * 60 + mm

export default defineAppConfig({
  brand,

  /** Horario del negocio. 0 = domingo … 6 = sábado. `null` = cerrado. */
  businessHours: {
    0: [{ start: h(10), end: h(15) }],
    1: null,
    2: [{ start: h(10), end: h(20) }],
    3: [{ start: h(10), end: h(20) }],
    4: [{ start: h(10), end: h(20) }],
    5: [{ start: h(10), end: h(20) }],
    6: [{ start: h(10), end: h(20) }],
  },

  booking: {
    slotInterval: 15,
    bufferMinutes: 0,
    minAdvanceMinutes: 60,
    maxDaysAhead: 45,
    accent: '#C9B38A',
  },

  /** Vocabulario del giro: cambia "barbero" por "doctor", "estilista", "tatuador"… */
  terms: {
    professional: 'barbero',
    professionals: 'barberos',
    team: 'Equipo',
    anyProfessional: 'Cualquiera disponible',
    anyProfessionalHint: 'Te asignamos al barbero con el primer horario libre.',
    client: 'cliente',
    clients: 'clientes',
    service: 'servicio',
    services: 'servicios',
  },

  /** Textos del sitio público. */
  copy: {
    heroEyebrow: 'Barbería · Guadalajara',
    heroTitle: 'Tu estilo,',
    heroTitleItalic: 'a tu hora.',
    heroSubtitle: 'Cortes de precisión, barba con toalla caliente y rituales de cuidado en un espacio pensado para desconectarte. Reserva en línea en menos de un minuto.',
    heroPrimaryCta: 'Reservar cita',
    heroSecondaryCta: 'Ver servicios',
    heroStats: [
      { value: '4.9', label: 'en Google · 600+ reseñas' },
      { value: '8 años', label: 'en Guadalajara' },
    ],
    servicesTitle: 'Servicios',
    servicesSubtitle: 'Precios finales en MXN. Todos los servicios incluyen lavado, styling y bebida de cortesía.',
    teamTitle: 'El equipo',
    teamSubtitle: 'Cuatro especialistas, un mismo estándar: precisión, puntualidad y buena conversación.',
    testimonialsTitle: 'Lo que dicen nuestros clientes',
    locationTitle: 'Visítanos',
    locationSubtitle: 'Estacionamiento en convenio a media cuadra. A unos minutos del centro de la ciudad.',
    ctaTitle: 'Tu próximo corte está a un minuto.',
    ctaSubtitle: 'Elige servicio, barbero y horario. Te confirmamos por WhatsApp.',
  },

  author: {
    name: 'JacoboDev',
    url: 'https://jacobodev.pages.dev',
    label: 'jacobodev.pages.dev',
  },

  demo: {
    adminUser: 'demo',
    adminPassword: 'demo123',
  },
})
