import { APP_LOCALES } from './locales'

/** Keep identity and non-text fields stable while the active locale changes. */
export function localizedEntity<T extends object>(
  original: T,
  payloads: unknown,
  fields: readonly (keyof T)[],
  locale: () => string
): T {
  const parseObject = (value: unknown): Record<string, unknown> => {
    try {
      const parsed = typeof value === 'string' ? JSON.parse(value) : value
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
        ? parsed as Record<string, unknown>
        : {}
    } catch {
      return {}
    }
  }

  const parsed = parseObject(payloads)
  const looksLikeLocaleMap = Object.entries(parsed).some(([key, value]) =>
    APP_LOCALES.includes(key as (typeof APP_LOCALES)[number]) &&
    Object.keys(parseObject(value)).length > 0
  )
  const translations: Record<string, Record<string, unknown>> = looksLikeLocaleMap
    ? Object.fromEntries(Object.entries(parsed).map(([key, value]) => [key, parseObject(value)]))
    : { vi: parsed }

  const result = { ...original }
  for (const field of fields) {
    Object.defineProperty(result, field, {
      enumerable: true,
      get: () => {
        const activeLocale = locale()
        if (activeLocale === 'en') return original[field]
        const value = translations[activeLocale]?.[String(field)]
        const valid = typeof original[field] === 'string'
          ? typeof value === 'string' && value.trim().length > 0
          : Array.isArray(original[field]) && Array.isArray(value) && value.length > 0 &&
            value.every(item => typeof item === 'string' && item.trim().length > 0)
        return valid ? value : original[field]
      }
    })
  }
  return result
}
