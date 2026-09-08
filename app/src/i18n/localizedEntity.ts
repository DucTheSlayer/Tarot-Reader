/** Keep identity and non-text fields stable while the active locale changes. */
export function localizedEntity<T extends object>(
  original: T,
  payload: unknown,
  fields: readonly (keyof T)[],
  locale: () => string
): T {
  let translation: Record<string, unknown> = {}
  try {
    const parsed = typeof payload === 'string' ? JSON.parse(payload) : payload
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) translation = parsed
  } catch { /* A bad translation must not prevent reading the original card. */ }
  const result = { ...original }
  for (const field of fields) {
    const value = translation[String(field)]
    const valid = typeof original[field] === 'string'
      ? typeof value === 'string' && value.trim().length > 0
      : Array.isArray(original[field]) && Array.isArray(value) && value.length > 0 &&
        value.every(item => typeof item === 'string' && item.trim().length > 0)
    if (valid) Object.defineProperty(result, field, {
      enumerable: true,
      get: () => locale() === 'vi' ? value : original[field]
    })
  }
  return result
}
