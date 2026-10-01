import { describe, expect, it } from 'vitest'
import { createDeck } from '../test/fixtures'
import {
  buildLoveSummary,
  buildMoneySummary,
  buildOpenQuestionSummary,
  buildYearlyNorthStar,
  getLoveCardReading,
  getMoneyCardReading
} from './spreadReadings'

describe('spread readings', () => {
  const cards = createDeck(5)

  it('does not build a three-card summary from an incomplete spread', () => {
    expect(buildLoveSummary(cards.slice(0, 2), 'single')).toBe('')
    expect(buildMoneySummary(cards.slice(0, 2), 'general')).toEqual([])
    expect(buildOpenQuestionSummary(cards.slice(0, 2))).toBe('')
  })

  it('builds love copy from the selected context and card position', () => {
    const reading = getLoveCardReading(cards[0], 0, 'relationship')
    const summary = buildLoveSummary(cards.slice(0, 3), 'relationship')

    expect(reading.meaning).toContain('Within your current relationship')
    expect(reading.meaning).toContain(cards[0].meaning)
    expect(summary).toContain(cards[0].name)
    expect(summary).toContain(cards[2].advice)
  })

  it('builds the three expected money summary sections', () => {
    const reading = getMoneyCardReading(cards[2], 2, 'incomeCareer')
    const summary = buildMoneySummary(cards.slice(0, 3), 'incomeCareer')

    expect(reading.meaning).toContain('Around income and career')
    expect(reading.advice).toBe(cards[2].advice)
    expect(summary.map((section) => section.title)).toEqual([
      'Opportunity',
      'Watch carefully',
      'Next step'
    ])
  })

  it('creates a complete yearly North Star from five cards', () => {
    const northStar = buildYearlyNorthStar(cards)

    expect(northStar.overview).toContain(cards[0].name)
    expect(northStar.highlights).toHaveLength(4)
    expect(northStar.highlights[3]).toContain(cards[4].name)
  })

  it('keeps an open three-card question free of fixed positional roles', () => {
    for (const spread of [cards.slice(0, 3), [cards[2], cards[0], cards[1]]]) {
      const summary = buildOpenQuestionSummary(spread)
      for (const card of spread) expect(summary).toContain(card.name)
      expect(summary).toContain('none has a fixed role')
      expect(summary).not.toMatch(/sets the tone|turning point|way forward|past|future/i)
      for (const card of spread) expect(summary).not.toContain(card.advice)
    }
  })
})
