<script setup lang="ts">
import { ui } from '../../i18n/reading'
import { computed, ref } from 'vue'
import type { TarotCard } from '../../types/tarotCard'
import {
  getLoveCardReading,
  LOVE_CONTEXT_OPTIONS,
  LOVE_SLOTS,
  type LoveContext
} from '../../data/spreadReadings'
import { useDrawCards } from '../../composables/useDrawCards'
import ScreenHeader from '../../components/common/ScreenHeader.vue'
import ScreenContent from '../../components/common/ScreenContent.vue'
import CardDrawAnimation from '../../components/common/CardDrawAnimation.vue'
import CardResultItem from '../../components/common/CardResultItem.vue'
import CardSlotLabel from '../../components/common/CardSlotLabel.vue'
import ContextChipGroup from '../../components/common/ContextChipGroup.vue'
import SpreadSummary from '../../components/common/SpreadSummary.vue'
import DrawAgainBar from '../../components/common/DrawAgainBar.vue'
import PrimaryButton from '../../components/common/PrimaryButton.vue'

type Phase = 'initial' | 'drawing' | 'result'

const LOVE_CONTEXT_SLOTS: Record<LoveContext, readonly [string, string, string]> = {
  single: ['You right now', 'What to open to', 'A new direction'],
  exploring: ['Your feelings', 'Their signals', 'Potential between you'],
  relationship: ['You', 'Your partner', 'Energy between you']
}

const { draw } = useDrawCards()
const phase = ref<Phase>('initial')
const cards = ref<TarotCard[]>([])
const context = ref<LoveContext | ''>('')
const currentSlots = computed(() =>
  context.value ? LOVE_CONTEXT_SLOTS[context.value] : LOVE_SLOTS
)

const cardDetails = computed(() => {
  const ctx = context.value
  if (!ctx) return []
  return cards.value.map((card, index) => ({
    card,
    label: currentSlots.value[index],
    ...getLoveCardReading(card, index, ctx)
  }))
})

function selectContext(value: string) {
  if (LOVE_CONTEXT_OPTIONS.some((option) => option.value === value)) {
    context.value = value as LoveContext
  }
}

function startDraw() {
  if (!context.value || phase.value !== 'initial') return
  cards.value = draw(3)
  phase.value = 'drawing'
}

function onRevealed() {
  if (phase.value !== 'drawing') return
  phase.value = 'result'
}

function drawAgain() {
  cards.value = []
  phase.value = 'initial'
}
</script>

<template>
  <main
    class="screen love-screen"
    :class="[
      `love-screen--${context || 'unselected'}`,
      { 'love-screen--result': phase === 'result' }
    ]"
  >
    <ScreenHeader class="love__header" :title='ui("Love Tarot")' back-to="/tarot" />
    <ScreenContent :spread="phase === 'initial'">
      <CardDrawAnimation
        :cards="cards"
        :active="phase === 'drawing'"
        :tappable="false"
        :show-captions="phase === 'result'"
        :captions="cards.map((card, index) => ({ label: currentSlots[index], name: card.name }))"
        :preview-captions="[...currentSlots]"
        :preview-context="context"
        layout="triangle"
        variant="love"
        :fly-duration="360"
        :hold-duration="180"
        :flip-duration="520"
        @revealed="onRevealed"
      >
        <template v-if="cards.length && context">
          <template v-if="phase === 'result'">
            <article
              v-for="(detail, index) in cardDetails"
              :key="detail.card.id"
              class="love__card"
              :class="`reveal-item reveal-item--${index + 1}`"
            >
              <CardSlotLabel :label="detail.label" />
              <CardResultItem
                :card="detail.card"
                :meaning="detail.meaning"
                :advice="detail.advice"
                :show-image="false"
                variant="love"
              />
            </article>
            <SpreadSummary
              class="reveal-item reveal-item--4"
              variant="love"
              :cards="cards"
              :context="context"
            />
            <div class="reveal-item reveal-item--5 reveal-actions">
              <DrawAgainBar back-to="/tarot" @draw-again="drawAgain" />
            </div>
          </template>
        </template>
      </CardDrawAnimation>

      <Transition name="idle">
        <div v-if="phase === 'initial'" class="screen__idle love__idle">
          <div class="love__intro">
            <p class="love__eyebrow">{{ ui("A connection spread") }}</p>
            <p class="screen__intro">{{ ui("Discover what you bring, the energy you are meeting, and the pattern forming between you.") }}</p>
          </div>
          <ContextChipGroup
            :label='ui("Choose your relationship context")'
            name="love-context"
            :model-value="context"
            :options="LOVE_CONTEXT_OPTIONS"
            @update:model-value="selectContext"
          />
          <p v-if="context" class="love__three-card-note">{{ ui("This spread uses 3 cards") }}</p>
          <PrimaryButton :disabled="!context" @click="startDraw">{{ ui("Draw 3 Cards") }}</PrimaryButton>
        </div>
      </Transition>
    </ScreenContent>
  </main>
</template>

<style scoped>
.love-screen {
  position: relative;
}

.love-screen::before {
  position: absolute;
  inset: 0;
  z-index: -1;
  content: '';
  opacity: 0;
  pointer-events: none;
  transition: opacity 620ms ease;
}

.love-screen--result::before { opacity: 1; }
.love-screen--result .love__header {
  border-radius: var(--radius-lg);
  background: linear-gradient(135deg, rgba(35, 20, 61, 0.98), rgba(57, 27, 73, 0.98));
  box-shadow:
    0 -60px 0 28px rgba(35, 20, 61, 0.98),
    0 10px 28px rgba(11, 7, 28, 0.34);
  backdrop-filter: blur(12px);
}
.love-screen--single::before {
  background: radial-gradient(circle at 50% 32%, rgba(227, 191, 137, 0.25), transparent 28%), linear-gradient(145deg, #24102d, #563043 58%, #2a173a);
}
.love-screen--exploring::before {
  background: radial-gradient(circle at 50% 34%, rgba(202, 166, 231, 0.2), transparent 32%), linear-gradient(145deg, #111a42, #3d2266 55%, #653b68);
}
.love-screen--relationship::before {
  background: radial-gradient(circle at 50% 38%, rgba(227, 191, 137, 0.2), transparent 26%), linear-gradient(100deg, #4a172b, #371c4f 49%, #111c3e);
}

.love__idle {
  padding-bottom: var(--space-2);
}

.love__idle.idle-leave-active {
  pointer-events: none;
  transition-duration: 100ms;
}

.love__three-card-note {
  margin-top: calc(var(--space-2) * -1);
  color: #d8b4c4;
  font-family: var(--font-display);
  font-size: 12px;
  letter-spacing: 0.55px;
  text-align: center;
}

.love__intro {
  display: grid;
  gap: var(--space-2);
}

.love__eyebrow {
  color: var(--color-gold);
  font-family: var(--font-display);
  font-size: 12px;
  letter-spacing: 1.2px;
  text-align: center;
  text-transform: uppercase;
}

.love__card {
  display: flex;
  width: 100%;
  max-width: 460px;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
}

.love__card + .love__card {
  padding-top: var(--space-4);
  border-top: 1px solid var(--color-border);
}

@media (prefers-reduced-motion: reduce) {
  .love-screen::before {
    transition-duration: 120ms;
  }
}
</style>
