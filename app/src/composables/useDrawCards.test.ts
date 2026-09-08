import { describe, expect, it } from 'vitest'
import { createDeck } from '../test/fixtures'
import { drawCardsFromDeck } from './useDrawCards'

describe('drawCardsFromDeck', () => {
  it('draws the requested number of unique cards without mutating the deck', () => {
    const deck = createDeck(78)
    const idsBefore = deck.map((card) => card.id)
    const result = drawCardsFromDeck(deck, 5, () => 0.25)

    expect(result).toHaveLength(5)
    expect(new Set(result.map((card) => card.id))).toHaveLength(5)
    expect(deck.map((card) => card.id)).toEqual(idsBefore)
  })

  it('returns the full deck when the requested count is larger than the deck', () => {
    expect(drawCardsFromDeck(createDeck(3), 5, () => 0.5)).toHaveLength(3)
  })

  it('rejects invalid card counts', () => {
    expect(() => drawCardsFromDeck(createDeck(3), -1)).toThrow(
      'Card count must be a non-negative integer'
    )
    expect(() => drawCardsFromDeck(createDeck(3), 1.5)).toThrow(
      'Card count must be a non-negative integer'
    )
  })
})
