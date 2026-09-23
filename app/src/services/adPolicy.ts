export const INTERSTITIAL_COOLDOWN_MS = 60_000

// Full-screen ads must not interrupt startup. App Open remains available only
// from the dedicated QA screen so each format can still be tested in isolation.
export const APP_OPEN_AT_STARTUP_ENABLED = false

const BANNER_ROUTE_PREFIXES = ['/tarot', '/zodiac', '/settings'] as const
const BANNER_EXCLUDED_ROUTES = new Set(['/settings/ad-test'])

export function shouldShowBannerForPath(path: string): boolean {
  if (BANNER_EXCLUDED_ROUTES.has(path)) return false

  return BANNER_ROUTE_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`)
  )
}

export function isInterstitialCooldownComplete(
  lastShownAt: number,
  now = Date.now(),
  cooldownMs = INTERSTITIAL_COOLDOWN_MS
): boolean {
  return now - lastShownAt >= cooldownMs
}
