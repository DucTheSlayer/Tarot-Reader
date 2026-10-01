import { describe, expect, it } from 'vitest'
import { createDeck } from '../test/fixtures'
import { useCardSelection } from './useCardSelection'

function memoryStorage() {
  const values = new Map<string, string>()
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => { values.set(key, value) },
    removeItem: (key: string) => { values.delete(key) }
  }
}

describe('manual card selection', () => {
  it('does not open the deck until a nonempty question has been submitted', () => {
    const draw = useCardSelection(createDeck(78), 3)
    for (const question of ['', '   ', '\n\t']) {
      draw.start(question, 'manual')
      expect(draw.phase.value).toBe('initial')
      expect(draw.candidates.value).toEqual([])
    }
    draw.start('  My open question?  ', 'manual')
    expect(draw.phase.value).toBe('selecting')
    expect(draw.snapshot.value?.question).toBe('My open question?')
    expect(draw.cards.value).toEqual([])
  })
  it('allows deselecting any raised card before the third pick without changing face-down identities', () => {
    const draw = useCardSelection(createDeck(78), 3)
    draw.start('An open question', 'manual')
    const ids = draw.candidates.value.map((card) => card.id)
    draw.select(7)
    draw.select(2)
    draw.deselect(7)
    expect(draw.snapshot.value?.selected).toEqual([2])
    expect(draw.candidates.value.map((card) => card.id)).toEqual(ids)
    draw.select(7)
    draw.select(5)
    draw.deselect(2)
    expect(draw.snapshot.value?.selected).toEqual([2, 7, 5])
    expect(draw.phase.value).toBe('revealing')
    draw.revealAll()
    expect(draw.cards.value.map((card) => card.id)).toEqual([ids[2], ids[7], ids[5]])
  })
  it('binds face-down cards before choosing and restores an undone card to the same position', () => {
    const draw = useCardSelection(createDeck(78), 3, undefined, 'test', () => 0.25)
    draw.start('A question?', 'manual')
    const originalIds = draw.candidates.value.map((card) => card.id)
    draw.select(7)
    draw.select(7)
    draw.select(-1)
    draw.select(9)
    draw.select(2)
    expect(draw.cards.value.map((card) => card.id)).toEqual([originalIds[7], originalIds[2]])
    draw.reshuffle()
    expect(draw.candidates.value.map((card) => card.id)).toEqual(originalIds)
    draw.undo()
    draw.select(2)
    expect(draw.cards.value[1]?.id).toBe(originalIds[2])
    expect(new Set(originalIds).size).toBe(9)
  })

  it('requires all selections before revealing and locks the reading on its first reveal', () => {
    const draw = useCardSelection(createDeck(78), 3)
    draw.start('A question?', 'manual')
    draw.select(0)
    draw.revealAll()
    expect(draw.snapshot.value?.revealed).toEqual([])
    draw.select(1)
    draw.select(2)
    draw.undo()
    expect(draw.phase.value).toBe('selecting')
    draw.select(4)
    draw.reveal(2)
    const locked = JSON.stringify(draw.snapshot.value)
    draw.undo()
    draw.select(5)
    draw.reshuffle()
    draw.reveal(2)
    expect(JSON.stringify(draw.snapshot.value)).toBe(locked)
    draw.revealAll()
    expect(draw.phase.value).toBe('result')
  })

  it('resumes exact picks and reveal state after remount with localized card content', () => {
    const storage = memoryStorage()
    const deck = createDeck(78)
    const draw = useCardSelection(deck, 3, storage)
    draw.start('My private question', 'manual')
    draw.select(8)
    draw.select(0)
    const selecting = useCardSelection(deck, 3, storage)
    expect(selecting.snapshot.value).toEqual(draw.snapshot.value)
    selecting.select(6)
    selecting.reveal(1)
    const resumed = useCardSelection(deck.map((card) => ({ ...card, name: 'Localized name' })), 3, storage)
    expect(resumed.snapshot.value).toEqual(selecting.snapshot.value)
    expect(resumed.cards.value.map((card) => card.id)).toEqual(selecting.cards.value.map((card) => card.id))
    expect(resumed.cards.value[0]?.name).toBe('Localized name')
    expect(resumed.phase.value).toBe('revealing')
  })

  it('rejects corrupted, duplicate or missing card snapshots', () => {
    const storage = memoryStorage()
    const deck = createDeck(78)
    const draw = useCardSelection(deck, 3, storage)
    draw.start('A question?', 'manual')
    const valid = JSON.parse(JSON.stringify(draw.snapshot.value))
    for (const invalid of [null, { ...valid, selected: [0, 0] }, { ...valid, revealed: [0] },
      { ...valid, candidateIds: Array(9).fill('missing') }, { ...valid, count: 5 }]) {
      storage.setItem('tarot:open-spread:session', JSON.stringify(invalid))
      expect(useCardSelection(deck, 3, storage).phase.value).toBe('initial')
    }
  })

  it('supports quick readings, explicit reset and denied storage', () => {
    const storage = memoryStorage()
    const draw = useCardSelection(createDeck(78), 3, storage)
    draw.start('A question?', 'quick')
    expect(draw.cards.value).toHaveLength(3)
    expect(draw.phase.value).toBe('revealing')
    draw.reveal(0)
    draw.revealAll()
    expect(draw.phase.value).toBe('result')
    draw.reset()
    expect(useCardSelection(createDeck(78), 3, storage).phase.value).toBe('initial')
    const blocked = useCardSelection(createDeck(78), 3, {
      getItem: () => { throw new Error('denied') },
      setItem: () => { throw new Error('denied') },
      removeItem: () => { throw new Error('denied') }
    })
    blocked.start('A question?', 'manual')
    blocked.select(1)
    expect(blocked.cards.value).toHaveLength(1)
  })
})
