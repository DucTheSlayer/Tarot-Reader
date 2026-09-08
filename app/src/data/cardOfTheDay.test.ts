import { describe, expect, it } from 'vitest'
import { createDeck } from '../test/fixtures'
import { getCardOfTheDay, getDailyCard, toDateKey } from './cardOfTheDay'

describe('Card of the Day', () => {
  it('uses a stable local yyyy-mm-dd date key', () => {
    expect(toDateKey(new Date(2026, 8, 3, 12))).toBe('2026-09-03')
  })

  it('returns the same card for the same date and deck', () => {
    const deck = createDeck(78)

    expect(getDailyCard('2026-09-03', deck)).toBe(getDailyCard('2026-09-03', deck))
  })

  it('selects a card from the supplied deck without mutating it', () => {
    const deck = createDeck(78)
    const idsBefore = deck.map((card) => card.id)
    const selected = getCardOfTheDay(deck, new Date(2026, 8, 3, 12))

    expect(deck).toContain(selected)
    expect(deck.map((card) => card.id)).toEqual(idsBefore)
  })

  it('rejects an empty deck', () => {
    expect(() => getDailyCard('2026-09-03', [])).toThrow(
      'Cannot select a daily card from an empty deck'
    )
  })
})
