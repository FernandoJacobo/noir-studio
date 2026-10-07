// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt({
  rules: {
    // Con TypeScript las props opcionales ya son `undefined` por defecto.
    'vue/require-default-prop': 'off',
  },
})
