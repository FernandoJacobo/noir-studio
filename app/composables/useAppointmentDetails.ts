import type { Appointment } from '~~/types'

/** Datos derivados de una cita: servicios, profesional, cliente, links de calendario y WhatsApp. */
export function useAppointmentDetails(appointment: MaybeRefOrGetter<Appointment | undefined>) {
  const { brand } = useAppConfig()
  const services = useServicesStore()
  const staff = useStaffStore()
  const clients = useClientsStore()

  const apt = computed(() => toValue(appointment))
  const serviceList = computed(() => (apt.value ? services.resolve(apt.value.serviceIds) : []))
  const member = computed(() => (apt.value ? staff.get(apt.value.staffId) : undefined))
  const client = computed(() => (apt.value ? clients.get(apt.value.clientId) : undefined))

  const calendarEvent = computed(() => {
    const a = apt.value
    if (!a) return null
    const names = serviceList.value.map(s => s.name).join(' + ')
    return {
      uid: `${a.id}@${brand.siteUrl.replace(/^https?:\/\//, '')}`,
      title: `${names} · ${brand.name}`,
      description: [
        `Folio: ${a.folio}`,
        member.value ? `Con: ${member.value.name}` : '',
        `Total: ${formatPrice(a.price)} (pago en sucursal)`,
        `Reagendar o cancelar: ${brand.siteUrl}/cita/${a.id}`,
      ].filter(Boolean).join('\n'),
      location: brand.address,
      date: a.date,
      start: a.start,
      duration: a.duration,
      timezone: brand.timezone,
      utcOffset: brand.utcOffset,
      organizerName: brand.name,
      organizerEmail: brand.email,
    }
  })

  const googleUrl = computed(() => (calendarEvent.value ? googleCalendarUrl(calendarEvent.value) : '#'))

  function downloadIcs() {
    if (!calendarEvent.value || !apt.value) return
    downloadICS(`cita-${apt.value.folio}`, buildICS(calendarEvent.value))
  }

  const whatsappLink = computed(() => {
    const a = apt.value
    if (!a) return '#'
    const message = buildAppointmentMessage({
      businessName: brand.name,
      folio: a.folio,
      clientName: client.value?.name ?? 'cliente',
      services: serviceList.value.map(s => s.name),
      staffName: member.value?.name,
      dateLabel: capitalize(formatDateLong(a.date)),
      timeLabel: formatTime(a.start),
      total: formatPrice(a.price),
      address: brand.address,
      link: `${brand.siteUrl}/cita/${a.id}`,
    })
    return whatsappUrl(brand.whatsapp, message)
  })

  return { apt, serviceList, member, client, googleUrl, downloadIcs, whatsappLink }
}
