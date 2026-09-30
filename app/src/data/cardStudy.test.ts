import { describe, expect, it } from 'vitest'
import translatedCards from '../../../database/translations/cards.vi.json'
import { artworkStudy, rankStudy, suitStudy } from './cardStudy.vi'

describe('Vietnamese card study notes', () => {
  it('explains every Major Arcana illustration and every Minor Arcana suit and rank', () => {
    const cardIds = Object.keys(translatedCards)
    const majorIds = cardIds.filter(id => !/-of-(wands|cups|swords|pentacles)$/.test(id))

    expect(majorIds).toHaveLength(22)
    expect(majorIds.every(id => Boolean(artworkStudy[id]))).toBe(true)
    expect(Object.keys(suitStudy).sort()).toEqual(['cups', 'pentacles', 'swords', 'wands'])
    expect(Object.keys(rankStudy).map(Number).sort((a, b) => a - b)).toEqual(
      Array.from({ length: 14 }, (_, index) => index + 1)
    )
    expect(Object.keys(artworkStudy).every(id => cardIds.includes(id))).toBe(true)

    for (const note of [...Object.values(suitStudy), ...Object.values(rankStudy), ...Object.values(artworkStudy)]) {
      expect(note.label.trim().length).toBeGreaterThan(4)
      expect(note.meaning.trim().length).toBeGreaterThan(40)
    }
  })
})
