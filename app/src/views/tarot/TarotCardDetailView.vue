<script setup lang="ts">
import { ui } from '../../i18n/reading'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import MysticalBackground from '../../components/common/MysticalBackground.vue'
import ScreenHeader from '../../components/common/ScreenHeader.vue'
import { useCardStore } from '../../stores/cardStore'

const route = useRoute()
const cardStore = useCardStore()
const card = computed(() =>
  cardStore.cards.value.find((item) => item.id === String(route.params.cardId))
)

const category = computed(() => {
  if (!card.value) return ''
  if (card.value.arcanaType === 'major') return `${ui('Major Arcana')} · ${card.value.majorNumber}`
  return `${ui(card.value.suit ?? '')} · ${card.value.rankNumber}`
})

const answerLabel = computed(() => {
  const value = card.value?.yesNo ?? ''
  return value ? ui(value.charAt(0).toUpperCase() + value.slice(1)) : ''
})
</script>

<template>
  <main class="screen card-detail">
    <MysticalBackground />
    <ScreenHeader :title="card?.name ?? ui('Card not found')" back-to="/tarot/library" />

    <div v-if="card" class="card-detail__scroll">
      <section class="card-detail__hero">
        <div class="card-detail__image-frame">
          <img :src="card.image" :alt="card.name" class="card-detail__image" />
        </div>
        <div class="card-detail__identity">
          <span>{{ category }}</span>
          <h2>{{ card.name }}</h2>
        </div>
      </section>

      <section class="card-detail__section">
        <span class="card-detail__eyebrow">{{ ui("Meaning") }}</span>
        <p>{{ card.meaning }}</p>
      </section>

      <section class="card-detail__section">
        <span class="card-detail__eyebrow">{{ ui("Guidance") }}</span>
        <p>{{ card.advice }}</p>
      </section>

      <section class="card-detail__section card-detail__section--answer">
        <div>
          <span class="card-detail__eyebrow">{{ ui("Yes / No energy") }}</span>
          <strong>{{ answerLabel }}</strong>
        </div>
        <p>{{ card.yesNoMeaning }}</p>
      </section>
    </div>

    <section v-else class="card-detail__missing">
      <span aria-hidden="true">✦</span>
      <h2>{{ ui("This card is not in the library") }}</h2>
      <router-link to="/tarot/library">{{ ui("Return to all 78 cards") }}</router-link>
    </section>
  </main>
</template>

<style scoped>
.card-detail { isolation: isolate; }
.card-detail__scroll {
  z-index: 1;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  width: 100%;
  max-width: 620px;
  margin: 0 auto;
  padding: 2px 1px var(--space-3);
}
.card-detail__hero {
  display: grid;
  grid-template-columns: minmax(112px, 38%) 1fr;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-3);
  border: 1px solid rgba(230, 199, 107, 0.32);
  border-radius: var(--radius-lg);
  background: rgba(20, 10, 40, 0.84);
}
.card-detail__image-frame {
  overflow: hidden;
  aspect-ratio: 5 / 7;
  border: 1px solid rgba(230, 199, 107, 0.5);
  border-radius: var(--radius-md);
  box-shadow: 0 8px 26px rgba(0, 0, 0, 0.42);
}
.card-detail__image { display: block; width: 100%; height: 100%; object-fit: cover; }
.card-detail__identity { display: flex; min-width: 0; flex-direction: column; gap: var(--space-2); }
.card-detail__identity span {
  color: var(--color-text-muted);
  font-size: 10px;
  text-transform: capitalize;
}
.card-detail__identity h2 { color: var(--color-gold); font-size: clamp(19px, 6vw, 30px); line-height: 1.25; }
.card-detail__section {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--space-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: rgba(26, 21, 48, 0.78);
}
.card-detail__eyebrow {
  color: var(--color-gold);
  font-family: var(--font-display);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.11em;
  text-transform: uppercase;
}
.card-detail__section p { color: var(--color-text-muted); font-size: 13px; line-height: 1.7; }
.card-detail__section--answer { border-color: rgba(230, 199, 107, 0.34); }
.card-detail__section--answer > div { display: flex; align-items: center; justify-content: space-between; gap: var(--space-3); }
.card-detail__section--answer strong { color: var(--color-gold); font-family: var(--font-display); font-size: 18px; }
.card-detail__missing {
  z-index: 1;
  display: grid;
  flex: 1;
  place-content: center;
  gap: var(--space-3);
  text-align: center;
}
.card-detail__missing span { color: var(--color-gold); font-size: 32px; }
.card-detail__missing h2 { font-size: 19px; }
.card-detail__missing a { color: var(--color-gold); }
</style>
