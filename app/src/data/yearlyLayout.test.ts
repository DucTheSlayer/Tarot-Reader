import { describe, expect, it } from 'vitest'
import { getYearlyLayout } from './yearlyLayout'

describe('Yearly animation layout', () => {
  it.each([[320, 568], [360, 640], [393, 873], [412, 915], [768, 1024], [1024, 600]])(
    'keeps all five cards inside a %i × %i viewport without overlaps',
    (width, height) => {
      const cards = getYearlyLayout(width, height)
      expect(cards).toHaveLength(5)
      for (const [index, card] of cards.entries()) {
        expect(card.w).toBeGreaterThan(0)
        expect(card.x).toBeGreaterThanOrEqual(24)
        expect(card.x + card.w).toBeLessThanOrEqual(width - 24 + 0.001)
        expect(card.y).toBeGreaterThanOrEqual(88)
        expect(card.y + card.h).toBeLessThanOrEqual(height - 48)
        for (const other of cards.slice(index + 1)) {
          expect(
            card.x + card.w <= other.x || other.x + other.w <= card.x ||
            card.y + card.h <= other.y || other.y + other.h <= card.y
          ).toBe(true)
        }
      }
    }
  )

  it('centers three cards above two cards on phones', () => {
    const cards = getYearlyLayout(393, 873)
    expect(cards[0].y).toBe(cards[2].y)
    expect(cards[3].y).toBe(cards[4].y)
    expect(cards[3].y).toBeGreaterThan(cards[0].y + cards[0].h)
    expect(cards[3].x).toBeCloseTo(393 - cards[4].x - cards[4].w)
  })
})
