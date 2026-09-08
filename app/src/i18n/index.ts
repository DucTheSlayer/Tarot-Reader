import { createI18n } from 'vue-i18n'
import en from '../locales/en.json'
import vi from '../locales/vi.json'
import { readLocale, saveLocale, type AppLocale } from './localePreference'

function browserStorage(): Storage | undefined {
  try {
    return typeof window === 'undefined' ? undefined : window.localStorage
  } catch {
    return undefined
  }
}

export const i18n = createI18n({
  legacy: false,
  locale: readLocale(browserStorage(), typeof navigator === 'undefined' ? [] : [navigator.language]),
  fallbackLocale: 'en',
  messages: { en, vi }
})

export function setAppLocale(locale: AppLocale) {
  i18n.global.locale.value = locale
  saveLocale(browserStorage(), locale)
  if (typeof document !== 'undefined') document.documentElement.lang = locale
}

if (typeof document !== 'undefined') document.documentElement.lang = i18n.global.locale.value
