import { createI18n, type LocaleMessageValue, type VueMessageType } from 'vue-i18n'
import { readLocale, saveLocale, type AppLocale } from './localePreference'

type MessageTree = Record<string, LocaleMessageValue<VueMessageType>>

const localeModules = import.meta.glob('../locales/*.json', {
  eager: true,
  import: 'default'
}) as Record<string, MessageTree>

export const messages = Object.fromEntries(
  Object.entries(localeModules)
    .filter(([path]) => !path.includes('/reading.'))
    .map(([path, catalogue]) => [path.match(/\/([^/]+)\.json$/)?.[1], catalogue])
    .filter((entry): entry is [string, MessageTree] => Boolean(entry[0]))
)

export function hasAppMessages(locale: AppLocale): boolean {
  return locale in messages
}

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
  messages
})

export function setAppLocale(locale: AppLocale) {
  i18n.global.locale.value = locale
  saveLocale(browserStorage(), locale)
  if (typeof document !== 'undefined') document.documentElement.lang = locale
}

if (typeof document !== 'undefined') document.documentElement.lang = i18n.global.locale.value
