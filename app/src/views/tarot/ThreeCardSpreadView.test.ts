import { afterEach, describe, expect, it, vi } from 'vitest'
import { createSSRApp } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { createMemoryHistory, createRouter } from 'vue-router'
import { createDeck } from '../../test/fixtures'
import { useCardSelection } from '../../composables/useCardSelection'
import { i18n, setAppLocale } from '../../i18n'
import ThreeCardSpreadView from './ThreeCardSpreadView.vue'

vi.mock('../../stores/cardStore', async () => {
  const { createDeck } = await import('../../test/fixtures')
  return { getCardsSnapshot: () => createDeck(78) }
})
vi.mock('../../services/advertising', () => ({ showInterstitialAtNaturalBreak: vi.fn() }))

function memoryStorage() {
  const values = new Map<string, string>()
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => { values.set(key, value) },
    removeItem: (key: string) => { values.delete(key) }
  }
}

afterEach(() => vi.unstubAllGlobals())

async function renderEntry(storage: ReturnType<typeof memoryStorage>) {
  vi.stubGlobal('window', { sessionStorage: storage, localStorage: memoryStorage() })
  setAppLocale('en')
  const router = createRouter({ history: createMemoryHistory(), routes: [{ path: '/tarot', component: ThreeCardSpreadView }] })
  await router.push('/tarot')
  await router.isReady()
  return renderToString(createSSRApp(ThreeCardSpreadView).use(i18n).use(router))
}

describe('three-card question entry', () => {
  it('starts with a required question and an unavailable draw button, without the fan', async () => {
    const html = await renderEntry(memoryStorage())
    expect(html).toContain('Your question')
    expect(html).toMatch(/<input[^>]*required/)
    expect(html).toMatch(/<button[^>]*type="submit"[^>]*disabled/)
    expect(html).not.toContain('data-candidate=')
  })

  it.each(['selecting', 'revealing', 'result'])('keeps the question step visible even with a saved %s reading', async (phase) => {
    const storage = memoryStorage()
    const reading = useCardSelection(createDeck(78), 3, storage)
    reading.start('What should I understand?', 'manual')
    reading.select(4)
    if (phase !== 'selecting') {
      reading.select(7)
      reading.select(1)
    }
    if (phase === 'result') reading.revealAll()
    const before = storage.getItem('tarot:open-spread:session')
    const html = await renderEntry(storage)
    expect(html).toContain('value="What should I understand?"')
    expect(html).toContain('type="submit"')
    expect(html).not.toContain('data-candidate=')
    expect(html).not.toContain('Combined message')
    expect(storage.getItem('tarot:open-spread:session')).toBe(before)
  })
})
