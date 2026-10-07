/**
 * Marca efectiva: `app.config.ts` + los datos del negocio editados en Configuración
 * (nombre, teléfono, WhatsApp, correo y dirección).
 */
export function useBrand() {
  const { brand } = useAppConfig()
  const settings = useSettingsStore()
  return computed(() => ({
    ...brand,
    name: settings.settings.name || brand.name,
    phone: settings.settings.phone || brand.phone,
    whatsapp: settings.settings.whatsapp || brand.whatsapp,
    email: settings.settings.email || brand.email,
    address: settings.settings.address || brand.address,
  }))
}
