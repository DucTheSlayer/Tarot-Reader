const KEY = 'tarot:onboarding-completed'
let completedInSession = false

export function hasCompletedOnboarding(): boolean {
  if (completedInSession) return true
  try {
    return window.localStorage.getItem(KEY) === 'true'
  } catch {
    return false
  }
}

export function completeOnboarding(): void {
  completedInSession = true
  try {
    window.localStorage.setItem(KEY, 'true')
  } catch {
    // Continue in this session even when persistent storage is unavailable.
  }
}
