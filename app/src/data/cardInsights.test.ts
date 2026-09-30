import { describe, expect, it } from 'vitest'
import cardInsights from './cardInsights.vi.json'
import translatedCards from '../../../database/translations/cards.vi.json'

describe('Vietnamese card insights', () => {
  it('gives all 78 cards a substantial meaning separate from the practical advice', () => {
    expect(Object.keys(translatedCards)).toHaveLength(78)
    for (const [id, row] of Object.entries(translatedCards)) {
      const [, meaning, advice] = row as string[]
      expect(meaning.trim().length, id).toBeGreaterThanOrEqual(200)
      expect((meaning.match(/[.!?]/g) ?? []).length, id).toBeGreaterThanOrEqual(3)
      expect(meaning, id).not.toContain(advice)
    }
  })

  it('provides distinct, complete detail for every card in the deck', () => {
    expect(Object.keys(cardInsights).sort()).toEqual(Object.keys(translatedCards).sort())

    for (const [id, insight] of Object.entries(cardInsights)) {
      expect(insight, id).toHaveLength(3)
      const [keywords, caution, question] = insight as [string[], string, string]
      expect(keywords, id).toHaveLength(3)
      expect(new Set(keywords).size, id).toBe(3)
      expect(keywords.every(keyword => keyword.trim().length >= 3), id).toBe(true)
      expect(caution.trim().length, id).toBeGreaterThan(35)
      expect(question.trim().endsWith('?'), id).toBe(true)
    }
  })
})
