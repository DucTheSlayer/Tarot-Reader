export type AppLocale = 'en' | 'vi'
export const LOCALE_STORAGE_KEY = 'tarot:locale'

export function resolveLocale(saved: string | null, languages: readonly string[]): AppLocale {
  if (saved === 'en' || saved === 'vi') return saved
  // Match the device's primary language; unsupported languages fall back to English.
  return languages[0]?.toLowerCase().split(/[-_]/)[0] === 'vi' ? 'vi' : 'en'
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
