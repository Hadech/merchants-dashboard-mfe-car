// import { createModuleFederationConfig } from '@module-federation/vite'

export default defineNuxtConfig({
  compatibilityDate: '2026-04-17',
  devtools: { enabled: true },
  ssr: false,

  future: {
    compatibilityVersion: 4,
  },

  css: ['~/assets/css/main.css'],

  modules: ['@nuxt/ui', '@pinia/nuxt'],

  vite: {
    plugins: [
      // TODO: Habilitar Module Federation cuando los remotes existan
      // createModuleFederationConfig({
      //   name: 'shell',
      //   remotes: {
      //     'mfe-transactions': {
      //       type: 'module',
      //       name: 'mfe-transactions',
      //       entry: process.env.MFE_TRANSACTIONS_URL || 'http://localhost:3001/remoteEntry.js',
      //     },
      //     'mfe-payouts': {
      //       type: 'module',
      //       name: 'mfe-payouts',
      //       entry: process.env.MFE_PAYOUTS_URL || 'http://localhost:3002/remoteEntry.js',
      //     },
      //     'mfe-settings': {
      //       type: 'module',
      //       name: 'mfe-settings',
      //       entry: process.env.MFE_SETTINGS_URL || 'http://localhost:3003/remoteEntry.js',
      //     },
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
