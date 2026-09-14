import { describe, expect, it } from 'vitest'
import {
  APP_OPEN_AT_STARTUP_ENABLED,
  INTERSTITIAL_COOLDOWN_MS,
  isInterstitialCooldownComplete,
  shouldShowBannerForPath
} from './adPolicy'

describe('ad placement policy', () => {
  it('never interrupts startup with an App Open ad', () => {
    expect(APP_OPEN_AT_STARTUP_ENABLED).toBe(false)
  })

  it.each(['/tarot', '/tarot/library', '/zodiac', '/settings'])(
    'shows the banner on the top-level route %s',
    (path) => {
      expect(shouldShowBannerForPath(path)).toBe(true)
    }
  )

  it.each([
    '/welcome',
    '/settings/ad-test',
    '/tarot/daily',
    '/tarot/yes-no',
    '/tarot/library/fool',
    '/zodiac/horoscope'
  ])('keeps the banner away from focused flow %s', (path) => {
    expect(shouldShowBannerForPath(path)).toBe(false)
  })

  it('enforces the interstitial cooldown', () => {
    const lastShownAt = 10_000

    expect(
      isInterstitialCooldownComplete(
        lastShownAt,
        lastShownAt + INTERSTITIAL_COOLDOWN_MS - 1
      )
    ).toBe(false)
    expect(
      isInterstitialCooldownComplete(
        lastShownAt,
        lastShownAt + INTERSTITIAL_COOLDOWN_MS
      )
    ).toBe(true)
  })
})
