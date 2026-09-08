import { readonly, ref } from 'vue'
import { cardRepository } from '../database/cardRepository'
import type { TarotCard } from '../types/tarotCard'

export type CardStoreStatus = 'idle' | 'loading' | 'ready' | 'error'

const cards = ref<TarotCard[]>([])
const status = ref<CardStoreStatus>('idle')
const errorMessage = ref('')

let loading: Promise<void> | null = null

export function loadCardStore(): Promise<void> {
  if (status.value === 'ready') return Promise.resolve()
  if (loading) return loading

  status.value = 'loading'
  errorMessage.value = ''

  loading = cardRepository
    .getAll()
    .then((loadedCards) => {
      if (loadedCards.length !== 78) {
        throw new Error(`Expected 78 active tarot cards, received ${loadedCards.length}`)
      }
      cards.value = loadedCards
      status.value = 'ready'
    })
    .catch((error: unknown) => {
      cards.value = []
      status.value = 'error'
      errorMessage.value = error instanceof Error ? error.message : String(error)
      throw error
    })
    .finally(() => {
      loading = null
    })

  return loading
}

export function getCardsSnapshot(): readonly TarotCard[] {
  if (status.value !== 'ready' || cards.value.length === 0) {
    throw new Error('Tarot card database is not ready')
  }
  return cards.value
}

export function useCardStore() {
  return {
    cards: readonly(cards),
    status: readonly(status),
    errorMessage: readonly(errorMessage),
    load: loadCardStore
  }
}
