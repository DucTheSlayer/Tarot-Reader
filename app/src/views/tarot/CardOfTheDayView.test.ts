import { afterEach, describe, expect, it, vi } from 'vitest'
import { createSSRApp } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { createMemoryHistory, createRouter } from 'vue-router'
import { i18n, setAppLocale } from '../../i18n'
import { toDateKey } from '../../data/cardOfTheDay'
import CardOfTheDayView from './CardOfTheDayView.vue'

vi.mock('/cards/back.svg', () => ({ default: '/cards/back.svg' }))
vi.mock('../../stores/cardStore', async () => {
  const { createDeck } = await import('../../test/fixtures')
  return { getCardsSnapshot: () => createDeck(78) }
})

interface DailyActions {
  revealCard: () => void
  grantClarificationSpread: () => void
}
function memoryStorage() {
  const entries = new Map<string, string>()
  return {
    getItem: (key: string) => entries.get(key) ?? null,
    setItem: (key: string, value: string) => { entries.set(key, value) }
  }
}
async function renderDaily(storage: ReturnType<typeof memoryStorage>) {
  vi.stubGlobal('window', { localStorage: storage })
  setAppLocale('en')
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/:pathMatch(.*)*', component: CardOfTheDayView }]
  })
  await router.push('/tarot/daily')
  const app = createSSRApp(CardOfTheDayView).use(i18n).use(router)
  let actions: DailyActions | undefined
  app.mixin({
    created() {
      if ((this.$.type as { __name?: string }).__name === 'CardOfTheDayView') {
        // Capture the real view handlers; SSR needs no browser or animation stubs.
        actions = (this.$ as unknown as { setupState: DailyActions }).setupState
      }
    }
  })
  const html = (await renderToString(app)).replace(/<!--[\s\S]*?-->/g, '')
  expect(actions).toBeDefined()
  return { html, actions: actions! }
}
afterEach(() => {
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

describe('daily clarification without ads', () => {
  it('draws immediately, limits the day to three distinct spreads and restores saved readings', async () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2026-10-06T12:00:00'))
    const storage = memoryStorage()
    let view = await renderDaily(storage)
    view.actions.revealCard()
    const key = `tarot:daily-clarification:${toDateKey(new Date())}`
    for (let count = 1; count <= 3; count++) {
      view = await renderDaily(storage)
      expect(view.html).toMatch(/<button[^>]*>\s*Draw 3 Cards\s*<\/button>/)
      view.actions.grantClarificationSpread()
      const saved = JSON.parse(storage.getItem(key)!) as { spreads: string[][] }
      expect(saved.spreads).toHaveLength(count)
      expect(saved.spreads.every(spread => spread.length === 3)).toBe(true)
      expect(new Set(saved.spreads.flat()).size).toBe(count * 3)
      expect(view.html).not.toMatch(/Watch.*ad|Preparing ad|No ad is available/)
    }
    const saved = storage.getItem(key)
    view = await renderDaily(storage)
    expect(view.html).not.toContain('Draw 3 Cards')
    expect(view.html).toContain('You have unlocked all 3 clarity readings for today.')
    expect(view.html).toContain('Reading 1')
    expect(view.html).toContain('Reading 3')
    view.actions.grantClarificationSpread()
    expect(storage.getItem(key)).toBe(saved)
  })
})
