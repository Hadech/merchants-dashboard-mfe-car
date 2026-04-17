import es_CO from './locales/es_CO.json'
import es_PA from './locales/es_PA.json'
import es_GT from './locales/es_GT.json'

export const messages = { es_CO, es_PA, es_GT }

export const i18nConfig = {
  locale: String(import.meta.env.VITE_I18N_LOCALE || 'es_CO'),
  fallbackLocale: String(import.meta.env.VITE_I18N_FALLBACK_LOCALE || 'es_PA'),
  messages,
}
