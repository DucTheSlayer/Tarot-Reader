import { i18n } from './index'

const readingModules = import.meta.glob('../locales/reading.*.json', {
  eager: true,
  import: 'default'
}) as Record<string, Record<string, string>>

const catalogues = Object.fromEntries(
  Object.entries(readingModules)
    .map(([path, catalogue]) => [path.match(/reading\.([^.]+(?:-[^.]+)?)\.json$/)?.[1], catalogue])
    .filter((entry): entry is [string, Record<string, string>] => Boolean(entry[0]))
)

/** Source-keyed catalogue for reading UI; never pass user-written questions here. */
export function ui(source: string, values: Record<string, string | number> = {}): string {
  const locale = i18n.global.locale.value
  const message = locale === 'en' ? source : catalogues[locale]?.[source] ?? source
  return message.replace(/\{(\w+)\}/g, (token, key: string) => String(values[key] ?? token))
}
