import { computed, ref } from 'vue'
import type { TarotCard } from '../types/tarotCard'
import { drawCardsFromDeck } from './useDrawCards'

export type DrawMode = 'manual' | 'quick'
export interface SelectionSnapshot {
  version: 1
  count: number
  mode: DrawMode
  question: string
  candidateIds: string[]
  selected: number[]
  revealed: number[]
}
type SnapshotStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

export function useCardSelection(
  deck: readonly TarotCard[],
  count: number,
  storage?: SnapshotStorage,
  storageKey = 'tarot:open-spread:session',
  random: () => number = Math.random
) {
  if (!Number.isInteger(count) || count < 1 || count > 9) throw new Error('Invalid spread size')
  const cardsById = new Map(deck.map((card) => [card.id, card]))

  function restore(): SelectionSnapshot | null {
    try {
      const raw = storage?.getItem(storageKey)
      if (!raw) return null
      const saved = JSON.parse(raw) as SelectionSnapshot
      const validIndexes = (list: unknown, limit: number): list is number[] =>
        Array.isArray(list) && new Set(list).size === list.length &&
        list.every((index) => Number.isInteger(index) && index >= 0 && index < limit)
      if (saved.version !== 1 || saved.count !== count ||
        !['manual', 'quick'].includes(saved.mode) ||
        typeof saved.question !== 'string' || !saved.question.trim() || saved.question.length > 160 ||
        !Array.isArray(saved.candidateIds) || saved.candidateIds.length !== 9 ||
        new Set(saved.candidateIds).size !== 9 ||
        !saved.candidateIds.every((id) => cardsById.has(id)) ||
        !validIndexes(saved.selected, 9) || saved.selected.length > count ||
        !validIndexes(saved.revealed, saved.selected.length) ||
        (saved.revealed.length > 0 && saved.selected.length !== count) ||
        (saved.mode === 'quick' && saved.selected.length !== count)) return null
      return saved
    } catch {
      return null
    }
  }

  const snapshot = ref<SelectionSnapshot | null>(restore())
  function commit(next: SelectionSnapshot | null) {
    snapshot.value = next
    try {
      if (next) storage?.setItem(storageKey, JSON.stringify(next))
      else storage?.removeItem(storageKey)
    } catch {
      // Keep the current reading usable when browser storage is unavailable.
    }
  }

  const candidates = computed(() => snapshot.value?.candidateIds.map((id) => cardsById.get(id)!) ?? [])
  const cards = computed(() => snapshot.value?.selected.map((index) => candidates.value[index]!) ?? [])
  const phase = computed(() => {
    const state = snapshot.value
    if (!state) return 'initial'
    if (state.selected.length < count) return 'selecting'
    return state.revealed.length === count ? 'result' : 'revealing'
  })

  function start(question: string, mode: DrawMode) {
    const candidateIds = drawCardsFromDeck(deck, 9, random).map((card) => card.id)
    if (candidateIds.length !== 9 || !question.trim() || question.trim().length > 160) return
    commit({ version: 1, count, mode, question: question.trim(), candidateIds,
      selected: mode === 'quick' ? Array.from({ length: count }, (_, index) => index) : [], revealed: [] })
  }

  function select(index: number) {
    const state = snapshot.value
    if (!state || phase.value !== 'selecting' || !Number.isInteger(index) ||
      index < 0 || index >= state.candidateIds.length || state.selected.includes(index)) return
    commit({ ...state, selected: [...state.selected, index] })
  }

  function undo() {
    const state = snapshot.value
    if (!state || state.mode !== 'manual' || state.revealed.length || !state.selected.length) return
    commit({ ...state, selected: state.selected.slice(0, -1) })
  }

  function reshuffle() {
    const state = snapshot.value
    if (!state || state.selected.length || state.mode !== 'manual') return
    start(state.question, state.mode)
  }

  function deselect(index: number) {
    const state = snapshot.value
    if (!state || state.mode !== 'manual' || phase.value !== 'selecting') return
    commit({ ...state, selected: state.selected.filter((candidate) => candidate !== index) })
  }

  function reveal(index: number) {
    const state = snapshot.value
    if (!state || phase.value !== 'revealing' || !Number.isInteger(index) ||
      index < 0 || index >= count || state.revealed.includes(index)) return
    commit({ ...state, revealed: [...state.revealed, index] })
  }

  function revealAll() {
    const state = snapshot.value
    if (!state || phase.value !== 'revealing') return
    commit({ ...state, revealed: Array.from({ length: count }, (_, index) => index) })
  }

  return { snapshot: computed(() => snapshot.value), candidates, cards, phase,
    start, select, deselect, undo, reshuffle, reveal, revealAll, reset: () => commit(null) }
}
