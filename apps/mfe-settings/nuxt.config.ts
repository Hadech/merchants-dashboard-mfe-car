// import { createModuleFederationConfig } from '@module-federation/vite'

export default defineNuxtConfig({
  devtools: { enabled: true },
  ssr: false,
  modules: ['@nuxt/ui'],

  vite: {
    plugins: [
      // TODO: Enable Module Federation remote when ready
      // createModuleFederationConfig({
      //   name: 'mfe-settings',
      //   filename: 'remoteEntry.js',
      //   exposes: {
      //     './SettingsApp': './app/app.vue',
      //   },
      //   shared: {
      //     vue: { singleton: true, requiredVersion: '^3.5.0' },
      //     pinia: { singleton: true, requiredVersion: '^3.0.0' },
      //     'vue-i18n': { singleton: true, requiredVersion: '^11.0.0' },
      //     ofetch: { singleton: true },
      //   },
      // }),
    ],
  },
})
