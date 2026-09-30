import { describe, expect, it } from 'vitest'
import {
  APP_OPEN_AT_STARTUP_ENABLED,
  INTERSTITIAL_COOLDOWN_MS,
  isInterstitialCooldownComplete,
  normalizeBannerHeight,
  shouldShowBannerForPath
} from './adPolicy'

describe('ad placement policy', () => {
  it('never interrupts startup with an App Open ad', () => {
    expect(APP_OPEN_AT_STARTUP_ENABLED).toBe(false)
  })

  it.each([
    '/tarot',
    '/tarot/daily',
    '/tarot/yes-no',
    '/tarot/love',
    '/tarot/money',
    '/tarot/yearly',
    '/tarot/3-card-spread',
    '/tarot/library',
    '/tarot/library/fool',
    '/zodiac',
    '/zodiac/origin',
    '/zodiac/origin/aries',
    '/zodiac/horoscope',
    '/settings',
    '/settings/language'
  ])(
    'shows the banner throughout the content route %s',
    (path) => {
      expect(shouldShowBannerForPath(path)).toBe(true)
    }
  )

  it.each([
    '/welcome',
    '/settings/ad-test',
    '/unrecognised'
  ])('keeps the banner away from excluded route %s', (path) => {
    expect(shouldShowBannerForPath(path)).toBe(false)
  })

  it('enforces the interstitial cooldown', () => {
    const lastShownAt = 10_000

    expect(INTERSTITIAL_COOLDOWN_MS).toBe(60_000)

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

  it.each([
    [0, 50],
    [-1, 50],
    [Number.NaN, 50],
    [49.2, 50],
    [50, 50],
    [50.2, 51],
    [90, 90]
  ])('normalizes banner height %s to %s CSS pixels', (height, expected) => {
    expect(normalizeBannerHeight(height)).toBe(expected)
  })
})
