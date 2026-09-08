import { beforeEach, afterEach, expect, it, vi } from 'vitest'

beforeEach(() => { vi.resetModules() })
afterEach(() => { vi.unstubAllGlobals() })

it('persists completion across app sessions without marking an unread guide complete', async () => {
  const values = new Map<string, string>()
  vi.stubGlobal('window', { localStorage: {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value)
  } })
  const first = await import('./onboarding')
  expect(first.hasCompletedOnboarding()).toBe(false)
  first.completeOnboarding()
  vi.resetModules()
  const next = await import('./onboarding')
  expect(next.hasCompletedOnboarding()).toBe(true)
})

it('lets users continue when accessing storage throws', async () => {
  vi.stubGlobal('window', { get localStorage() { throw new Error('Storage unavailable') } })
  const onboarding = await import('./onboarding')
  expect(onboarding.hasCompletedOnboarding()).toBe(false)
  expect(() => onboarding.completeOnboarding()).not.toThrow()
  expect(onboarding.hasCompletedOnboarding()).toBe(true)
})
