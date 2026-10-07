import type { Client } from '~~/types'

type SeedClient = Omit<Client, 'id' | 'createdAt'>

const raw: SeedClient[] = [
  { name: 'Emiliano Gutiérrez', phone: '3318462093', email: 'emiliano.gtz@gmail.com', baseVisits: 14, notes: 'Low fade #1, deja largo arriba. Prefiere a Santiago.' },
  { name: 'Rodrigo Villaseñor', phone: '3326157784', email: 'rvillasenor@outlook.com', baseVisits: 9, notes: 'Piel sensible: usar bálsamo sin alcohol.' },
  { name: 'Andrés Plascencia', phone: '3330981245', email: 'andres.plas@gmail.com', baseVisits: 22, notes: 'Cliente desde la apertura. Café americano sin azúcar.' },
  { name: 'Luis Fernando Orozco', phone: '3312774590', email: 'lf.orozco@hotmail.com', baseVisits: 5, notes: '' },
  { name: 'Javier Medina', phone: '3335590218', email: 'javi.medina@gmail.com', baseVisits: 7, notes: 'Barba larga: solo perfilar contorno, no rebajar volumen.' },
  { name: 'Sebastián Aceves', phone: '3319038867', email: 'sebas.aceves@icloud.com', baseVisits: 3, notes: '' },
  { name: 'Carlos Ibarra', phone: '3324417736', email: 'carlos.ibarra@empresa.mx', baseVisits: 18, notes: 'Agenda los martes temprano antes de la oficina.' },
  { name: 'Mauricio Zepeda', phone: '3331186402', email: 'mau.zepeda@gmail.com', baseVisits: 11, notes: 'Camuflaje de canas cada 3 semanas.' },
  { name: 'Diego Arellano', phone: '3317725591', email: 'diegoarellano@gmail.com', baseVisits: 1, notes: 'Llegó por Instagram.' },
  { name: 'Fernando Lomelí', phone: '3328863014', email: 'fer.lomeli@outlook.com', baseVisits: 6, notes: '' },
  { name: 'Ricardo Navarro', phone: '3336604479', email: 'ricardo.nav@gmail.com', baseVisits: 12, notes: 'Trae a su hijo (8 años) los sábados.' },
  { name: 'Alejandro Huerta', phone: '3313350826', email: 'alex.huerta@gmail.com', baseVisits: 4, notes: 'Alergia al aceite de árbol de té.' },
  { name: 'Pablo Sandoval', phone: '3325591340', email: 'psandoval@icloud.com', baseVisits: 0, notes: '' },
  { name: 'Héctor Gallardo', phone: '3332278815', email: 'hector.gallardo@gmail.com', baseVisits: 16, notes: 'Siempre Ritual NOIR el último sábado del mes.' },
  { name: 'Iván Camarena', phone: '3314469027', email: 'ivan.camarena@hotmail.com', baseVisits: 2, notes: '' },
  { name: 'Óscar Becerra', phone: '3327714358', email: 'oscar.becerra@gmail.com', baseVisits: 8, notes: 'Prefiere conversación mínima.' },
  { name: 'Tomás Jáuregui', phone: '3338825169', email: 'tomasjauregui@gmail.com', baseVisits: 10, notes: '' },
  { name: 'Daniel Cervantes', phone: '3311936672', email: 'daniel.cerv@outlook.com', baseVisits: 3, notes: 'Pidió recordatorio por WhatsApp un día antes.' },
  { name: 'Gerardo Topete', phone: '3329047783', email: 'gtopete@empresa.mx', baseVisits: 19, notes: '' },
  { name: 'Arturo Preciado', phone: '3334158894', email: 'arturo.preciado@gmail.com', baseVisits: 5, notes: 'Mid fade, raya marcada del lado izquierdo.' },
  { name: 'Mariana Ochoa', phone: '3316260015', email: 'mariana.ochoa@gmail.com', baseVisits: 4, notes: 'Facial detox mensual con Valeria.' },
  { name: 'Ximena Robles', phone: '3323371126', email: 'xime.robles@icloud.com', baseVisits: 2, notes: 'Piel mixta. Evitar exfoliante físico.' },
  { name: 'Joaquín Barragán', phone: '3330482237', email: 'joaquin.barragan@gmail.com', baseVisits: 13, notes: '' },
  { name: 'Eduardo Michel', phone: '3315593348', email: 'eduardo.michel@hotmail.com', baseVisits: 1, notes: 'Novio de una clienta; regalo de cumpleaños.' },
  { name: 'Rafael Covarrubias', phone: '3326604459', email: 'rafa.covarrubias@gmail.com', baseVisits: 27, notes: 'Cliente VIP. Ofrecer whisky de cortesía.' },
]

export function createSeedClients(now: Date): Client[] {
  return raw.map((c, i) => {
    // Clientes con pocas visitas se registraron en las últimas dos semanas (alimenta el KPI "clientes nuevos").
    const daysAgo = c.baseVisits <= 2 ? 1 + ((i * 3) % 13) : 40 + c.baseVisits * 21
    const created = new Date(now.getTime() - daysAgo * 86_400_000)
    return { ...c, id: `cli_${String(i + 1).padStart(3, '0')}`, createdAt: created.toISOString() }
  })
}
