import type { BusinessSettings } from '~~/types'

export const useSettingsStore = defineStore('noir-settings', () => {
  const settings = ref<BusinessSettings>(structuredClone(useDemoSeed().settings))

  function update(patch: Partial<BusinessSettings>) {
    settings.value = { ...settings.value, ...patch }
  }

  function reset(seed = useDemoSeed()) {
    settings.value = structuredClone(seed.settings)
  }

  return { settings, update, reset }
}, { persist: true })
