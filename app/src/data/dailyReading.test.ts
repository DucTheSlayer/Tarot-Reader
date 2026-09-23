import { describe, expect, it } from 'vitest'
import { buildDailyFortune } from './dailyReading'

describe('buildDailyFortune', () => {
  it('returns the three requested daily aspects in a stable order', () => {
    expect(buildDailyFortune({ deckOrder: 19, suit: null, yesNo: 'yes' }).map(({ aspect }) => aspect))
      .toEqual(['finance', 'love', 'career'])
  })

  it('keeps every score within the one-to-five scale', () => {
    for (let deckOrder = 0; deckOrder < 78; deckOrder += 1) {
      for (const yesNo of ['yes', 'no', 'maybe', 'uncertain'] as const) {
        const scores = buildDailyFortune({ deckOrder, suit: 'pentacles', yesNo })
        expect(scores.every(({ score }) => score >= 1 && score <= 5)).toBe(true)
      }
    }
  })

  it('applies suit affinity to the relevant aspect', () => {
    const cups = buildDailyFortune({ deckOrder: 36, suit: 'cups', yesNo: 'maybe' })
    const wands = buildDailyFortune({ deckOrder: 36, suit: 'wands', yesNo: 'maybe' })

    expect(cups.find(({ aspect }) => aspect === 'love')!.score)
      .toBeGreaterThan(wands.find(({ aspect }) => aspect === 'love')!.score)
  })
})
