<script setup lang="ts">
import { ui } from '../../i18n/reading'
import { computed, ref } from 'vue'
import MysticalBackground from '../../components/common/MysticalBackground.vue'
import ScreenHeader from '../../components/common/ScreenHeader.vue'
import { useCardStore } from '../../stores/cardStore'
import type { TarotCard, TarotSuit } from '../../types/tarotCard'

type LibraryFilter = 'all' | 'major' | TarotSuit

const cardStore = useCardStore()
const search = ref('')
const activeFilter = ref<LibraryFilter>('all')

const filters: Array<{ value: LibraryFilter; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'major', label: 'Major' },
  { value: 'wands', label: 'Wands' },
  { value: 'cups', label: 'Cups' },
  { value: 'swords', label: 'Swords' },
  { value: 'pentacles', label: 'Pentacles' }
]

const visibleCards = computed(() => {
  const query = search.value.trim().toLocaleLowerCase()
  return cardStore.cards.value.filter((card) => {
    const matchesFilter =
      activeFilter.value === 'all' ||
      (activeFilter.value === 'major'
        ? card.arcanaType === 'major'
        : card.suit === activeFilter.value)
    const matchesSearch =
      query === '' ||
      card.name.toLocaleLowerCase().includes(query) ||
      card.meaning.toLocaleLowerCase().includes(query)
    return matchesFilter && matchesSearch
  })
})

function cardCategory(card: TarotCard): string {
  if (card.arcanaType === 'major') return `${ui('Major Arcana')} · ${card.majorNumber}`
  return `${ui(card.suit ?? '')} · ${card.rankNumber}`
}

function thumbnailPath(image: string): string {
  return image.replace(/^\/cards\//, '/card-thumbnails/')
}
</script>

<template>
  <main class="screen library">
    <MysticalBackground :animate="false" />
    <ScreenHeader :title='ui("Card Library")' back-to="/tarot" />

    <section class="library__controls" :aria-label='ui("Filter Tarot cards")'>
      <label class="library__search">
        <span class="library__search-icon" aria-hidden="true">⌕</span>
        <span class="sr-only">{{ ui("Search cards") }}</span>
        <input v-model="search" type="search" :placeholder='ui("Search 78 cards…")' />
      </label>

      <div class="library__filters" role="group" :aria-label='ui("Arcana and suit")'>
        <button
          v-for="filter in filters"
          :key="filter.value"
          type="button"
          :aria-pressed="activeFilter === filter.value"
          :class="{ 'library__filter--active': activeFilter === filter.value }"
          class="library__filter"
          @click="activeFilter = filter.value"
        >
          {{ ui(filter.label) }}
        </button>
      </div>

      <p class="library__count">{{ ui('{count} cards', { count: visibleCards.length }) }}</p>
    </section>

    <div class="library__scroll">
      <div v-if="visibleCards.length" class="library__grid">
        <router-link
          v-for="(card, index) in visibleCards"
          :key="card.id"
          :to="`/tarot/library/${card.id}`"
          class="library-card"
        >
          <div class="library-card__image-wrap">
            <img
              :src="thumbnailPath(card.image)"
              :alt="card.name"
              class="library-card__image"
              :loading="index < 4 ? 'eager' : 'lazy'"
              :fetchpriority="index < 4 ? 'high' : 'low'"
              decoding="async"
              width="300"
              height="420"
            />
          </div>
          <div class="library-card__info">
            <span>{{ cardCategory(card) }}</span>
            <strong>{{ card.name }}</strong>
          </div>
        </router-link>
      </div>

      <div v-else class="library__empty">
        <span aria-hidden="true">✦</span>
        <h2>{{ ui("No cards found") }}</h2>
        <p>{{ ui("Try another name or choose a different deck section.") }}</p>
      </div>
    </div>
  </main>
</template>

<style scoped>
.library { isolation: isolate; }

.library__controls {
  z-index: 1;
  display: flex;
  flex-shrink: 0;
  flex-direction: column;
  gap: var(--space-2);
}

.library__search {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  min-height: 44px;
  padding: 0 var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  background: rgba(20, 10, 40, 0.82);
  color: var(--color-text-muted);
}

.library__search:focus-within { border-color: var(--color-gold); }
.library__search-icon { color: var(--color-gold); font-size: 22px; }
.library__search input {
  width: 100%;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--color-text);
  font: inherit;
}
.library__search input::placeholder { color: var(--color-text-muted); }

.library__filters {
  display: flex;
  gap: var(--space-2);
  overflow-x: auto;
  padding: 2px 1px;
  scrollbar-width: none;
}
.library__filters::-webkit-scrollbar { display: none; }

.library__filter {
  min-height: 32px;
  flex: 0 0 auto;
  padding: 0 var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  background: rgba(26, 21, 48, 0.8);
  color: var(--color-text-muted);
  font: 600 11px/1 var(--font-sans);
  cursor: pointer;
}
.library__filter--active {
  border-color: rgba(230, 199, 107, 0.6);
  background: var(--color-primary-soft);
  color: var(--color-gold);
}
.library__filter:focus-visible { outline: 2px solid var(--color-gold); outline-offset: 2px; }

.library__count {
  color: var(--color-text-muted);
  font-size: 11px;
  text-align: right;
}

.library__scroll {
  z-index: 1;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 2px 1px var(--space-2);
}

.library__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-3);
  max-width: 720px;
  margin: 0 auto;
}

.library-card {
  overflow: hidden;
  border: 1px solid rgba(230, 199, 107, 0.32);
  border-radius: var(--radius-md);
  background: rgba(20, 10, 40, 0.82);
  color: var(--color-text);
  box-shadow: var(--shadow-sm);
  transition: border-color 180ms ease, box-shadow 220ms ease, transform 180ms ease;
}
.library-card__image-wrap {
  aspect-ratio: 5 / 7;
  overflow: hidden;
  background: var(--color-surface-raised);
}
.library-card__image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 300ms cubic-bezier(0.22, 1, 0.36, 1), filter 220ms ease;
}

.library-card:active { transform: scale(0.975); }

@media (hover: hover) {
  .library-card:hover {
    border-color: rgba(230, 199, 107, 0.7);
    box-shadow: var(--shadow-md), 0 0 16px rgba(230, 199, 107, 0.1);
    transform: translateY(-3px);
  }

  .library-card:hover .library-card__image {
    transform: scale(1.045);
    filter: saturate(1.08);
  }
}
.library-card__info { display: flex; flex-direction: column; gap: 3px; padding: var(--space-2); }
.library-card__info span {
  color: var(--color-text-muted);
  font-size: 9px;
  text-transform: capitalize;
}
.library-card__info strong {
  overflow: hidden;
  color: var(--color-gold);
  font-family: var(--font-display);
  font-size: 12px;
  line-height: 1.35;
  white-space: normal;
  overflow-wrap: anywhere;
}

.library__empty {
  display: grid;
  min-height: 240px;
  place-content: center;
  gap: var(--space-2);
  color: var(--color-text-muted);
  text-align: center;
}
.library__empty span { color: var(--color-gold); font-size: 28px; }
.library__empty h2 { color: var(--color-gold); font-size: 18px; }
.library__empty p { max-width: 280px; font-size: 13px; line-height: 1.5; }

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@media (min-width: 620px) {
  .library__grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}

@media (prefers-reduced-motion: reduce) {
  .library-card {
    transition: none;
  }

  .library-card__image { transition: none; }
}
</style>
