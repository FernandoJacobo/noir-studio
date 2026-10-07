import type { StaffMember, WeeklySchedule } from '~~/types'

const h = (hh: number, mm = 0) => hh * 60 + mm
const portrait = (id: string) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=480&h=600&q=70&crop=faces`

/** Martes a sábado de 10 a 20 con comida de 14 a 15. */
const fullWeek: WeeklySchedule = {
  0: null,
  1: null,
  2: [{ start: h(10), end: h(14) }, { start: h(15), end: h(20) }],
  3: [{ start: h(10), end: h(14) }, { start: h(15), end: h(20) }],
  4: [{ start: h(10), end: h(14) }, { start: h(15), end: h(20) }],
  5: [{ start: h(10), end: h(14) }, { start: h(15), end: h(20) }],
  6: [{ start: h(10), end: h(14) }, { start: h(15), end: h(20) }],
}

export const seedStaff: StaffMember[] = [
  {
    id: 'stf_santiago',
    name: 'Santiago Ríos',
    role: 'Master barber · Fundador',
    bio: 'Quince años detrás de la silla. Formado en Barcelona, obsesionado con la tijera y los cortes clásicos.',
    photo: portrait('1507003211169-0a1dd7228f2d'),
    specialties: ['Tijera', 'Cortes clásicos', 'Afeitado'],
    serviceIds: ['srv_corte', 'srv_fade', 'srv_barba', 'srv_afeitado', 'srv_corte_barba', 'srv_ritual', 'srv_canas'],
    schedule: fullWeek,
    daysOff: [],
    active: true,
    instagram: '@santiago.noir',
  },
  {
    id: 'stf_diego',
    name: 'Diego Herrera',
    role: 'Barbero senior',
    bio: 'Especialista en fades y diseños a navaja. Si lo puedes imaginar, lo puede delinear.',
    photo: portrait('1500648767791-00dcc994a43e'),
    specialties: ['Skin fade', 'Diseños', 'Barba'],
    serviceIds: ['srv_corte', 'srv_fade', 'srv_barba', 'srv_corte_barba', 'srv_canas'],
    schedule: {
      0: [{ start: h(10), end: h(15) }],
      1: null,
      2: null,
      3: [{ start: h(11), end: h(15) }, { start: h(16), end: h(20) }],
      4: [{ start: h(11), end: h(15) }, { start: h(16), end: h(20) }],
      5: [{ start: h(11), end: h(15) }, { start: h(16), end: h(20) }],
      6: [{ start: h(10), end: h(15) }, { start: h(16), end: h(20) }],
    },
    daysOff: [],
    active: true,
    instagram: '@diegofades',
  },
  {
    id: 'stf_mateo',
    name: 'Mateo Cárdenas',
    role: 'Barbero',
    bio: 'Barba, toalla caliente y paciencia. El favorito de quienes buscan un afeitado perfecto.',
    photo: portrait('1506794778202-cad84cf45f1d'),
    specialties: ['Barba', 'Afeitado clásico', 'Texturizado'],
    serviceIds: ['srv_corte', 'srv_barba', 'srv_afeitado', 'srv_corte_barba', 'srv_ritual'],
    schedule: {
      0: [{ start: h(10), end: h(15) }],
      1: null,
      2: [{ start: h(12), end: h(16) }, { start: h(17), end: h(20) }],
      3: [{ start: h(12), end: h(16) }, { start: h(17), end: h(20) }],
      4: null,
      5: [{ start: h(12), end: h(16) }, { start: h(17), end: h(20) }],
      6: [{ start: h(10), end: h(14) }, { start: h(15), end: h(20) }],
    },
    daysOff: [],
    active: true,
  },
  {
    id: 'stf_valeria',
    name: 'Valeria Núñez',
    role: 'Especialista en skincare',
    bio: 'Cosmetóloga certificada. Diseña tratamientos faciales a la medida de cada tipo de piel.',
    photo: portrait('1438761681033-6461ffad8d80'),
    specialties: ['Faciales', 'Skincare', 'Color'],
    serviceIds: ['srv_facial', 'srv_canas'],
    schedule: {
      0: null,
      1: null,
      2: [{ start: h(10), end: h(14) }, { start: h(15), end: h(18) }],
      3: null,
      4: [{ start: h(10), end: h(14) }, { start: h(15), end: h(19) }],
      5: [{ start: h(10), end: h(14) }, { start: h(15), end: h(19) }],
      6: [{ start: h(10), end: h(16) }],
    },
    daysOff: [],
    active: true,
    instagram: '@vale.skin',
  },
]
