<script setup lang="ts">
import { ui } from '../../i18n/reading'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { i18n } from '../../i18n'
import cardInsightsVi from '../../data/cardInsights.vi.json'
import { studyForCard } from '../../data/cardStudy.vi'
import MysticalBackground from '../../components/common/MysticalBackground.vue'
import ScreenHeader from '../../components/common/ScreenHeader.vue'
import TarotGlyph from '../../components/tarot/TarotGlyph.vue'
import { useCardStore } from '../../stores/cardStore'
import type { TarotSuit } from '../../types/tarotCard'

type CardInsight = [keywords: [string, string, string], caution: string, question: string]
const insights = cardInsightsVi as unknown as Record<string, CardInsight>
const suitGlyphs: Record<TarotSuit, 'flame' | 'drop' | 'swords' | 'pentacle'> = {
  wands: 'flame', cups: 'drop', swords: 'swords', pentacles: 'pentacle'
}
const suitElements: Record<TarotSuit, string> = {
  wands: 'Lửa', cups: 'Nước', swords: 'Khí', pentacles: 'Đất'
}
const viLabels = {
  keywords: 'Từ khóa',
  element: 'Nguyên tố',
  caution: 'Điều cần lưu ý',
  question: 'Tự hỏi mình',
  study: 'Giải mã lá bài',
  suit: 'Chất bài',
  rank: 'Số và vai trò',
  artwork: 'Chi tiết trong tranh'
}

const route = useRoute()
const cardStore = useCardStore()
const returnTo = computed(() => route.query.from === '/tarot/daily' ? '/tarot/daily' : '/tarot/library')
const card = computed(() =>
  cardStore.cards.value.find((item) => item.id === String(route.params.cardId))
)
const insight = computed(() => i18n.global.locale.value === 'vi' && card.value
  ? insights[card.value.id] ?? null
  : null)
const study = computed(() => insight.value && card.value ? studyForCard(card.value) : null)
const suitGlyph = computed(() => card.value?.suit ? suitGlyphs[card.value.suit] : 'star')
const suitElement = computed(() => insight.value && card.value?.suit ? suitElements[card.value.suit] : null)

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
    <ScreenHeader :title="card?.name ?? ui('Card not found')" :back-to="returnTo" />

    <div v-if="card" class="card-detail__scroll">
      <section class="card-detail__hero">
        <div class="card-detail__image-frame">
          <img :src="card.image" :alt="card.name" class="card-detail__image" decoding="async" />
        </div>
        <div class="card-detail__identity">
          <div class="card-detail__sigil"><TarotGlyph :kind="suitGlyph" /></div>
          <span class="card-detail__category">{{ category }}</span>
          <h2>{{ card.name }}</h2>
          <span v-if="suitElement" class="card-detail__element">{{ viLabels.element }} · {{ suitElement }}</span>
        </div>
      </section>

      <section v-if="insight" class="card-detail__keywords" :aria-label="viLabels.keywords">
        <span class="card-detail__keywords-title">{{ viLabels.keywords }}</span>
        <div class="card-detail__keyword-list">
          <span v-for="keyword in insight[0]" :key="keyword" class="card-detail__keyword">{{ keyword }}</span>
        </div>
      </section>

      <section class="card-detail__section card-detail__section--meaning">
        <div class="card-detail__section-heading">
          <span class="card-detail__section-icon"><TarotGlyph kind="star" /></span>
          <h3>{{ ui("Meaning") }}</h3>
        </div>
        <p class="card-detail__lead">{{ card.meaning }}</p>
      </section>

      <section v-if="study" class="card-detail__section card-detail__section--study">
        <div class="card-detail__section-heading">
          <span class="card-detail__section-icon"><TarotGlyph kind="layers" /></span>
          <h3>{{ viLabels.study }}</h3>
        </div>
        <div class="card-detail__study-list">
          <div v-if="study.suit" class="card-detail__study-item">
            <span class="card-detail__study-glyph"><TarotGlyph :kind="suitGlyph" /></span>
            <div>
              <span class="card-detail__study-caption">{{ viLabels.suit }}</span>
              <strong>{{ study.suit.label }}</strong>
              <p>{{ study.suit.meaning }}</p>
            </div>
          </div>
          <div v-if="study.rank" class="card-detail__study-item">
            <span class="card-detail__study-glyph"><TarotGlyph kind="star" /></span>
            <div>
              <span class="card-detail__study-caption">{{ viLabels.rank }}</span>
              <strong>{{ study.rank.label }}</strong>
              <p>{{ study.rank.meaning }}</p>
            </div>
          </div>
          <div v-if="study.artwork" class="card-detail__study-item card-detail__study-item--artwork">
            <span class="card-detail__study-glyph"><TarotGlyph kind="moon" /></span>
            <div>
              <span class="card-detail__study-caption">{{ viLabels.artwork }}</span>
              <strong>{{ study.artwork.label }}</strong>
              <p>{{ study.artwork.meaning }}</p>
            </div>
          </div>
        </div>
      </section>

      <section v-if="insight" class="card-detail__section card-detail__section--caution">
        <div class="card-detail__section-heading">
          <span class="card-detail__section-icon"><TarotGlyph kind="moon" /></span>
          <h3>{{ viLabels.caution }}</h3>
        </div>
        <p>{{ insight[1] }}</p>
      </section>

      <section v-if="insight" class="card-detail__section card-detail__section--question">
        <div class="card-detail__section-heading">
          <span class="card-detail__section-icon"><TarotGlyph kind="question" /></span>
          <h3>{{ viLabels.question }}</h3>
        </div>
        <p>{{ insight[2] }}</p>
      </section>

      <section class="card-detail__section">
        <div class="card-detail__section-heading">
          <span class="card-detail__section-icon"><TarotGlyph kind="compass" /></span>
          <h3>{{ ui("Guidance") }}</h3>
        </div>
        <p>{{ card.advice }}</p>
      </section>

      <section class="card-detail__section card-detail__section--answer">
        <div class="card-detail__section-heading">
          <span class="card-detail__section-icon"><TarotGlyph kind="scales" /></span>
          <h3>{{ ui("Yes / No energy") }}</h3>
          <strong class="card-detail__answer-pill">{{ answerLabel }}</strong>
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
  gap: 12px;
  width: 100%;
  max-width: 620px;
  margin: 0 auto;
  padding: 2px 1px 24px;
}
.card-detail__hero {
  display: grid;
  grid-template-columns: minmax(112px, 37%) 1fr;
  align-items: center;
  gap: 18px;
  padding: 14px;
  border: 1px solid rgba(230, 199, 107, 0.42);
  border-radius: var(--radius-lg);
  background: radial-gradient(circle at 80% 8%, rgba(161, 107, 222, 0.2), transparent 50%), rgba(20, 10, 40, 0.9);
  box-shadow: 0 12px 30px rgba(4, 2, 14, 0.24);
}
.card-detail__image-frame {
  overflow: hidden;
  aspect-ratio: 5 / 7;
  border: 1px solid rgba(230, 199, 107, 0.68);
  border-radius: var(--radius-md);
  box-shadow: 0 8px 26px rgba(0, 0, 0, 0.42);
}
.card-detail__image { display: block; width: 100%; height: 100%; object-fit: cover; }
.card-detail__identity { display: flex; min-width: 0; flex-direction: column; align-items: flex-start; gap: 8px; }
.card-detail__sigil {
  display: grid;
  width: 42px;
  height: 42px;
  place-items: center;
  border: 1px solid rgba(230, 199, 107, 0.5);
  border-radius: 50%;
  background: rgba(230, 199, 107, 0.12);
  color: var(--color-gold);
}
.card-detail__sigil :deep(svg) { width: 26px; height: 26px; }
.card-detail__category {
  color: var(--color-text-muted);
  font-size: 11px;
  text-transform: capitalize;
}
.card-detail__identity h2 { color: var(--color-gold); font-size: clamp(19px, 5.5vw, 29px); line-height: 1.25; overflow-wrap: anywhere; }
.card-detail__element {
  border: 1px solid rgba(230, 199, 107, 0.3);
  border-radius: var(--radius-full);
  padding: 5px 10px;
  color: var(--color-text);
  font-size: 11px;
}
.card-detail__keywords {
  display: flex;
  flex-direction: column;
  gap: 9px;
  padding: 14px 16px;
  border: 1px solid rgba(230, 199, 107, 0.25);
  border-radius: var(--radius-md);
  background: rgba(26, 21, 48, 0.8);
}
.card-detail__keywords-title {
  color: var(--color-gold);
  font-family: var(--font-display);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.05em;
}
.card-detail__keyword-list { display: flex; flex-wrap: wrap; gap: 7px; }
.card-detail__keyword {
  padding: 6px 10px;
  border: 1px solid rgba(199, 164, 243, 0.36);
  border-radius: var(--radius-full);
  background: rgba(123, 75, 174, 0.18);
  color: var(--color-text);
  font-size: 12px;
  line-height: 1.25;
}
.card-detail__section {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 18px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: rgba(26, 21, 48, 0.84);
}
.card-detail__section--meaning { border-color: rgba(230, 199, 107, 0.42); }
.card-detail__section--study { border-color: rgba(176, 143, 226, 0.4); }
.card-detail__study-list { display: grid; gap: 9px; }
.card-detail__study-item {
  display: grid;
  grid-template-columns: 30px minmax(0, 1fr);
  gap: 10px;
  padding: 11px;
  border: 1px solid rgba(199, 164, 243, 0.2);
  border-radius: 12px;
  background: rgba(104, 71, 149, 0.12);
}
.card-detail__study-item--artwork { border-color: rgba(230, 199, 107, 0.27); }
.card-detail__study-glyph { color: var(--color-gold); padding-top: 3px; }
.card-detail__study-glyph :deep(svg) { width: 21px; height: 21px; }
.card-detail__study-item strong { display: block; color: var(--color-gold); font-size: 13px; line-height: 1.4; }
.card-detail__study-item p { margin-top: 3px; font-size: 13px; line-height: 1.55; }
.card-detail__study-caption {
  display: block;
  margin-bottom: 3px;
  color: var(--color-text-muted);
  font-size: 10px;
  line-height: 1.3;
}
.card-detail__section--caution { border-color: rgba(172, 150, 218, 0.36); }
.card-detail__section--question {
  border-color: rgba(230, 199, 107, 0.35);
  background: linear-gradient(125deg, rgba(90, 59, 126, 0.44), rgba(26, 21, 48, 0.85));
}
.card-detail__section-heading { display: flex; align-items: center; gap: 10px; }
.card-detail__section-icon {
  display: grid;
  width: 34px;
  height: 34px;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 10px;
  background: rgba(230, 199, 107, 0.12);
  color: var(--color-gold);
}
.card-detail__section h3 {
  color: var(--color-gold);
  font-family: var(--font-display);
  font-size: 14px;
  font-weight: 700;
  line-height: 1.35;
}
.card-detail__section p { color: var(--color-text); font-size: 14px; line-height: 1.7; }
.card-detail__section .card-detail__lead { font-size: 15px; }
.card-detail__section--question p { color: var(--color-gold); font-family: var(--font-display); font-size: 16px; line-height: 1.55; }
.card-detail__section--answer { border-color: rgba(230, 199, 107, 0.34); }
.card-detail__answer-pill {
  margin-left: auto;
  padding: 5px 10px;
  border: 1px solid rgba(230, 199, 107, 0.58);
  border-radius: var(--radius-full);
  color: var(--color-gold);
  font-family: var(--font-display);
  font-size: 14px;
  white-space: nowrap;
}
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
@media (max-width: 350px) {
  .card-detail__hero { gap: 12px; padding: 11px; }
  .card-detail__sigil { width: 36px; height: 36px; }
  .card-detail__section { padding: 15px; }
}
</style>
