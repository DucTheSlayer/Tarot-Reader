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

const { draw } = useDrawCards()
const phase = ref<Phase>('initial')
const cards = ref<TarotCard[]>([])
const context = ref<LoveContext | ''>('')
const detailIndex = ref<number | null>(null)

const detailReading = computed(() => {
  if (detailIndex.value === null || !context.value) return null
  const card = cards.value[detailIndex.value]
  if (!card) return null

  return {
    card,
    label: LOVE_SLOTS[detailIndex.value],
    ...getLoveCardReading(card, detailIndex.value, context.value)
  }
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
  phase.value = 'result'
}

function drawAgain() {
  cards.value = []
  detailIndex.value = null
  phase.value = 'initial'
}
</script>

<template>
  <main class="screen">
    <ScreenHeader :title='ui("Love Tarot")' back-to="/tarot" />
    <ScreenContent :spread="phase === 'initial'">
      <CardDrawAnimation
        :cards="cards"
        :active="phase === 'drawing'"
        :captions="cards.map((card, index) => ({ label: LOVE_SLOTS[index], name: card.name }))"
        layout="triangle"
        variant="love"
        :fly-duration="360"
        :hold-duration="180"
        :flip-duration="520"
        @revealed="onRevealed"
        @card-tap="(index) => (detailIndex = index)"
      >
        <template v-if="cards.length && context">
          <SpreadSummary
            class="reveal-item reveal-item--1"
            variant="love"
            :cards="cards"
            :context="context"
          />
          <p class="love__hint reveal-item reveal-item--2">{{ ui("Tap a card to explore its role") }}</p>
          <div class="reveal-item reveal-item--3 reveal-actions">
            <DrawAgainBar back-to="/tarot" @draw-again="drawAgain" />
          </div>
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
          <PrimaryButton :disabled="!context" @click="startDraw">{{ ui("Draw Cards") }}</PrimaryButton>
        </div>
      </Transition>
    </ScreenContent>

    <Transition name="sheet">
      <div v-if="detailReading" class="love-sheet" @click.self="detailIndex = null">
        <div class="love-sheet__panel" role="dialog" aria-modal="true" :aria-label='ui("Card detail")'>
          <button
            type="button"
            class="love-sheet__close"
            :aria-label='ui("Close")'
            @click="detailIndex = null"
          >
            ✕
          </button>
          <CardSlotLabel :label="detailReading.label" />
          <CardResultItem
            :card="detailReading.card"
            :meaning="detailReading.meaning"
            :advice="detailReading.advice"
            variant="love"
          />
        </div>
      </div>
    </Transition>
  </main>
</template>

<style scoped>
.love__idle {
  padding-bottom: var(--space-2);
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

.love__hint {
  color: var(--color-text-muted);
  font-size: 12.5px;
  text-align: center;
}

.love-sheet {
  position: fixed;
  inset: 0;
  z-index: 60;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: var(--space-4);
  background: rgba(10, 5, 25, 0.68);
}

.love-sheet__panel {
  position: relative;
  display: flex;
  width: 100%;
  max-width: 460px;
  max-height: 82vh;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
  overflow-y: auto;
  padding: var(--space-5) var(--space-4) var(--space-6);
  border: 1px solid rgba(230, 199, 107, 0.3);
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  background: var(--color-surface-raised);
  box-shadow: var(--shadow-lg);
  -webkit-overflow-scrolling: touch;
}

.love-sheet__close {
  position: absolute;
  top: var(--space-3);
  right: var(--space-3);
  width: 30px;
  height: 30px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  background: var(--color-surface);
  color: var(--color-text-muted);
  cursor: pointer;
  font-size: 14px;
  -webkit-tap-highlight-color: transparent;
}

.sheet-enter-active,
.sheet-leave-active {
  transition: opacity 250ms ease;
}

.sheet-enter-active .love-sheet__panel,
.sheet-leave-active .love-sheet__panel {
  transition: transform 280ms cubic-bezier(0.22, 1, 0.36, 1);
}

.sheet-enter-from,
.sheet-leave-to {
  opacity: 0;
}

.sheet-enter-from .love-sheet__panel,
.sheet-leave-to .love-sheet__panel {
  transform: translateY(40px);
}

@media (prefers-reduced-motion: reduce) {
  .sheet-enter-active,
  .sheet-leave-active,
  .sheet-enter-active .love-sheet__panel,
  .sheet-leave-active .love-sheet__panel {
    transition: none;
  }
}
</style>
