import { describe, expect, it } from 'vitest'
import { getThreeCardTriangleLayout } from './threeCardLayout'

describe('three-card triangle layout', () => {
  it.each([
    [320, 568, 88],
    [360, 640, 96],
    [393, 873, 104],
    [412, 915, 112]
  ])('stays below the header and inside a %sx%s viewport', (width, height, headerBottom) => {
    const cards = getThreeCardTriangleLayout(width, height, headerBottom)
    const [left, right, bottom] = cards

    expect(cards).toHaveLength(3)
    expect(Math.min(...cards.map(card => card.y))).toBeGreaterThan(headerBottom)
    expect(Math.min(...cards.map(card => card.x))).toBeGreaterThanOrEqual(0)
    expect(Math.max(...cards.map(card => card.x + card.w))).toBeLessThanOrEqual(width)
    expect(left.y).toBe(right.y)
    expect(left.x + left.w).toBeLessThan(right.x)
    expect(bottom.y).toBeGreaterThan(left.y + left.h)
    expect(bottom.x + bottom.w / 2).toBeCloseTo(width / 2)
  })

  it('uses the real header edge instead of a hard-coded screen ratio', () => {
    const shortTitle = getThreeCardTriangleLayout(393, 873, 80)
    const wrappedTitle = getThreeCardTriangleLayout(393, 873, 124)
    expect(wrappedTitle[0].y - shortTitle[0].y).toBe(44)
  })
})
