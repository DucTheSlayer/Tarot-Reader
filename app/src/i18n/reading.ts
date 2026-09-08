import { i18n } from './index'
import vietnamese from '../locales/reading.vi.json'

/** Source-keyed catalogue for reading UI; never pass user-written questions here. */
export function ui(source: string, values: Record<string, string | number> = {}): string {
  const catalogue: Record<string, string> = vietnamese
  const message = i18n.global.locale.value === 'vi' ? catalogue[source] ?? source : source
  return message.replace(/\{(\w+)\}/g, (token, key: string) => String(values[key] ?? token))
}
