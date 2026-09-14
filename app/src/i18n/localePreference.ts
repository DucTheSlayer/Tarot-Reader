import { isPublishedLocale, normalizeSupportedLocale, type AppLocale } from './locales'

export type { AppLocale } from './locales'
export const LOCALE_STORAGE_KEY = 'tarot:locale'

export function resolveLocale(saved: string | null, languages: readonly string[]): AppLocale {
  const savedLocale = normalizeSupportedLocale(saved)
  if (savedLocale && isPublishedLocale(savedLocale)) return savedLocale
  for (const language of languages) {
    const detected = normalizeSupportedLocale(language)
    if (detected && isPublishedLocale(detected)) return detected
  }
  return 'en'
}

export function readLocale(storage: Pick<Storage, 'getItem'> | undefined, languages: readonly string[]) {
  try {
    return resolveLocale(storage?.getItem(LOCALE_STORAGE_KEY) ?? null, languages)
  } catch {
    return resolveLocale(null, languages)
  }
}

export function saveLocale(storage: Pick<Storage, 'setItem'> | undefined, locale: AppLocale) {
  try {
    storage?.setItem(LOCALE_STORAGE_KEY, locale)
  } catch {
    // Storage can be unavailable; changing language must still work for this session.
  }
}
