export const APP_LOCALES = [
  'en',
  'vi',
  'es-419',
  'pt-BR',
  'id',
  'hi',
  'th',
  'fr',
  'de',
  'ja',
  'ko',
  'zh-TW'
] as const

export type AppLocale = (typeof APP_LOCALES)[number]

// Only expose locales after UI, reading copy and database content all pass QA.
// Planned locales stay registered so the infrastructure can be built and tested incrementally.
export const PUBLISHED_LOCALES: readonly AppLocale[] = [
  'en',
  'vi',
  'es-419',
  'pt-BR',
  'id',
  'hi',
  'th',
  'fr',
  'de',
  'ja',
  'ko'
]

export interface LocaleOption {
  value: AppLocale
  label: string
  englishLabel?: string
}

export const LOCALE_OPTIONS: readonly LocaleOption[] = [
  { value: 'en', label: 'English' },
  { value: 'vi', label: 'Tiếng Việt', englishLabel: 'Vietnamese' },
  { value: 'es-419', label: 'Español (Latinoamérica)', englishLabel: 'Spanish' },
  { value: 'pt-BR', label: 'Português (Brasil)', englishLabel: 'Portuguese' },
  { value: 'id', label: 'Bahasa Indonesia', englishLabel: 'Indonesian' },
  { value: 'hi', label: 'हिन्दी', englishLabel: 'Hindi' },
  { value: 'th', label: 'ไทย', englishLabel: 'Thai' },
  { value: 'fr', label: 'Français', englishLabel: 'French' },
  { value: 'de', label: 'Deutsch', englishLabel: 'German' },
  { value: 'ja', label: '日本語', englishLabel: 'Japanese' },
  { value: 'ko', label: '한국어', englishLabel: 'Korean' },
  { value: 'zh-TW', label: '繁體中文', englishLabel: 'Traditional Chinese' }
]

const localeByNormalizedCode = new Map(
  APP_LOCALES.map((locale) => [locale.toLowerCase(), locale] as const)
)

export function normalizeSupportedLocale(value: string | null | undefined): AppLocale | undefined {
  if (!value) return undefined
  const normalized = value.replace('_', '-').toLowerCase()
  const exact = localeByNormalizedCode.get(normalized)
  if (exact) return exact

  const language = normalized.split('-')[0]
  if (language === 'es') return 'es-419'
  if (language === 'pt') return 'pt-BR'
  if (language === 'zh' && (normalized.includes('tw') || normalized.includes('hant'))) return 'zh-TW'
  return localeByNormalizedCode.get(language)
}

export function isPublishedLocale(locale: AppLocale): boolean {
  return PUBLISHED_LOCALES.includes(locale)
}
