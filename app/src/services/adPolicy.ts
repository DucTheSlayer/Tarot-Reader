export const INTERSTITIAL_COOLDOWN_MS = 90_000

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
