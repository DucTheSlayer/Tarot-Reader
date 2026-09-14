export const INTERSTITIAL_COOLDOWN_MS = 90_000

// Full-screen ads must not interrupt startup. App Open remains available only
// from the dedicated QA screen so each format can still be tested in isolation.
export const APP_OPEN_AT_STARTUP_ENABLED = false

const BANNER_ROUTES = new Set([
  '/tarot',
  '/tarot/library',
  '/zodiac',
  '/settings'
])

export function shouldShowBannerForPath(path: string): boolean {
  return BANNER_ROUTES.has(path)
}

export function isInterstitialCooldownComplete(
  lastShownAt: number,
  now = Date.now(),
  cooldownMs = INTERSTITIAL_COOLDOWN_MS
): boolean {
  return now - lastShownAt >= cooldownMs
}
