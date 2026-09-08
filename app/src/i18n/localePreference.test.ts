import { describe, expect, it } from 'vitest'
import en from '../locales/en.json'
import vi from '../locales/vi.json'
import { LOCALE_STORAGE_KEY, readLocale, resolveLocale, saveLocale } from './localePreference'

describe('language preference', () => {
  it('uses the saved choice before device language', () => {
    expect(resolveLocale('en', ['vi-VN'])).toBe('en')
    expect(resolveLocale('vi', ['en-US'])).toBe('vi')
  })
  it('detects Vietnamese and falls back to English', () => {
    expect(resolveLocale(null, ['vi-VN'])).toBe('vi')
    expect(resolveLocale('invalid', ['VI_vn'])).toBe('vi')
    expect(resolveLocale(null, ['fr-FR'])).toBe('en')
    expect(resolveLocale(null, [])).toBe('en')
  })
  it('persists and restores the selected language', () => {
    const values = new Map<string, string>()
    const storage = {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => { values.set(key, value) }
    }
    saveLocale(storage, 'vi')
    expect(values.get(LOCALE_STORAGE_KEY)).toBe('vi')
    expect(readLocale(storage, ['en-US'])).toBe('vi')
  })
  it('still works when browser storage is blocked', () => {
    const storage = {
      getItem: () => { throw new Error('blocked') },
      setItem: () => { throw new Error('blocked') }
    }
    expect(readLocale(storage, ['vi-VN'])).toBe('vi')
    expect(() => saveLocale(storage, 'en')).not.toThrow()
  })
  it('has matching nonempty translation keys in both languages', () => {
    function keys(value: Record<string, unknown>, prefix = ''): string[] {
      return Object.entries(value).flatMap(([key, item]) => {
        if (typeof item === 'string') {
          expect(item.trim().length).toBeGreaterThan(0)
          return [`${prefix}${key}`]
        }
        return keys(item as Record<string, unknown>, `${prefix}${key}.`)
      }).sort()
    }
    expect(keys(vi)).toEqual(keys(en))
  })
})
