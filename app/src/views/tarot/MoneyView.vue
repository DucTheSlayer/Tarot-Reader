<script setup lang="ts">
import { ui } from '../../i18n/reading'
import { computed, ref } from 'vue'
import type { TarotCard } from '../../types/tarotCard'
import {
  getMoneyCardReading,
  MONEY_CONTEXT_OPTIONS,
  MONEY_SLOTS,
  type MoneyContext
} from '../../data/spreadReadings'
import { useDrawCards } from '../../composables/useDrawCards'
import ScreenHeader from '../../components/common/ScreenHeader.vue'
import ChevronIcon from '../../components/common/ChevronIcon.vue'
import ScreenContent from '../../components/common/ScreenContent.vue'
import CardDrawAnimation from '../../components/common/CardDrawAnimation.vue'
import CardResultItem from '../../components/common/CardResultItem.vue'
import CardSlotLabel from '../../components/common/CardSlotLabel.vue'
import ContextChipGroup from '../../components/common/ContextChipGroup.vue'
import SpreadSummary from '../../components/common/SpreadSummary.vue'
import DrawAgainBar from '../../components/common/DrawAgainBar.vue'
import PrimaryButton from '../../components/common/PrimaryButton.vue'

type Phase = 'initial' | 'drawing' | 'result'

const MONEY_STEP_SHORT = ['Current', 'Opportunity', 'Action'] as const

const { draw } = useDrawCards()
const phase = ref<Phase>('initial')
const cards = ref<TarotCard[]>([])
const context = ref<MoneyContext | ''>('')
const activeIndex = ref(0)
const detailIndex = ref<number | null>(null)

const contextLabel = computed(
  () => MONEY_CONTEXT_OPTIONS.find((option) => option.value === context.value)?.label ?? ''
)

const activeReading = computed(() => {
  if (!context.value) return null
  const card = cards.value[activeIndex.value]
  if (!card) return null

  return {
    card,
    label: MONEY_SLOTS[activeIndex.value],
    ...getMoneyCardReading(card, activeIndex.value, context.value)
  }
})

const detailReading = computed(() => {
  if (detailIndex.value === null || !context.value) return null
  const card = cards.value[detailIndex.value]
  if (!card) return null

  return {
    card,
    label: MONEY_SLOTS[detailIndex.value],
    ...getMoneyCardReading(card, detailIndex.value, context.value)
  }
})

function selectContext(value: string) {
  if (MONEY_CONTEXT_OPTIONS.some((option) => option.value === value)) {
    context.value = value as MoneyContext
  }
}

function startDraw() {
  if (!context.value || phase.value !== 'initial') return
  activeIndex.value = 0
  detailIndex.value = null
  cards.value = draw(3)
  phase.value = 'drawing'
}

function onRevealed() {
  activeIndex.value = 0
  phase.value = 'result'
}

function goTo(index: number) {
  if (index < 0 || index >= cards.value.length) return
  activeIndex.value = index
}

function drawAgain() {
  cards.value = []
  activeIndex.value = 0
  detailIndex.value = null
  phase.value = 'initial'
}
</script>

<template>
  <main class="screen themed-result-screen themed-result-screen--money" :class="{ 'themed-result-screen--active': phase === 'result' }">
    <ScreenHeader :title='ui("Money Tarot")' back-to="/tarot" />
    <ScreenContent :spread="phase === 'initial'">
      <CardDrawAnimation
        v-if="phase !== 'result'"
        :cards="cards"
        :active="phase === 'drawing'"
        :captions="cards.map((card, index) => ({ label: MONEY_SLOTS[index], name: card.name }))"
        :preview-captions="[...MONEY_SLOTS]"
        layout="row"
        variant="money"
        :fly-duration="360"
        :hold-duration="180"
        :flip-duration="520"
        @revealed="onRevealed"
      />

      <Transition name="result">
        <section v-if="phase === 'result' && cards.length && context" class="money-result">
          <div class="money-result__heading">
            <p class="money-result__eyebrow">{{ ui(contextLabel) }}</p>
            <h2 class="money-result__title">{{ ui("Your financial path") }}</h2>
          </div>

          <div class="money-result__steps" role="tablist" :aria-label='ui("Money reading steps")'>
            <button
              v-for="(label, index) in MONEY_STEP_SHORT"
              :key="label"
              type="button"
              class="money-result__step"
              :class="{ 'money-result__step--active': index === activeIndex }"
              role="tab"
              :aria-selected="index === activeIndex"
              :tabindex="index === activeIndex ? 0 : -1"
              @click="goTo(index)"
            >
              <span class="money-result__step-number">{{ index + 1 }}</span>
              <span>{{ ui(label) }}</span>
            </button>
          </div>

          <Transition name="money-card" mode="out-in">
            <article
              v-if="activeReading"
              :key="activeIndex"
              class="money-result__focus"
              role="tabpanel"
            >
              <button
                type="button"
                class="money-result__card-button"
                :aria-label="ui('Open {label}: {name}', { label: ui(activeReading.label), name: activeReading.card.name })"
                @click="detailIndex = activeIndex"
              >
                <img
                  :src="activeReading.card.image"
                  :alt="activeReading.card.name"
                  class="money-result__card-image"
                />
              </button>
              <CardSlotLabel :label="activeReading.label" />
              <h3 class="money-result__card-name">{{ activeReading.card.name }}</h3>
              <p class="money-result__meaning">{{ activeReading.meaning }}</p>
              <button
                type="button"
                class="money-result__detail-link"
                @click="detailIndex = activeIndex"
              >{{ ui("View full guidance") }}</button>
            </article>
          </Transition>

          <div class="money-result__nav" :aria-label='ui("Money reading navigation")'>
            <button
              type="button"
              :disabled="activeIndex === 0"
              :aria-label='ui("Previous step")'
              @click="goTo(activeIndex - 1)"
            >
              <ChevronIcon />
            </button>
            <span>{{ ui('{current} of {total}', { current: activeIndex + 1, total: cards.length }) }}</span>
            <button
              type="button"
              :disabled="activeIndex === cards.length - 1"
              :aria-label='ui("Next step")'
              @click="goTo(activeIndex + 1)"
            >
              <ChevronIcon direction="right" />
            </button>
          </div>

          <SpreadSummary variant="money" :cards="cards" :context="context" />

          <div class="reveal-actions">
            <DrawAgainBar back-to="/tarot" @draw-again="drawAgain" />
          </div>
        </section>
      </Transition>

      <Transition name="idle">
        <div v-if="phase === 'initial'" class="screen__idle money__idle">
          <div class="money__intro">
            <p class="money__eyebrow">{{ ui("A practical path forward") }}</p>
            <p class="screen__intro">{{ ui("Read the current position, the opportunity or obstacle, and the action worth considering next.") }}</p>
          </div>
          <ContextChipGroup
            :label='ui("Choose a financial focus")'
            name="money-context"
            :model-value="context"
            :options="MONEY_CONTEXT_OPTIONS"
            @update:model-value="selectContext"
          />
          <PrimaryButton :disabled="!context" @click="startDraw">{{ ui("Draw Cards") }}</PrimaryButton>
          <p class="money__initial-disclaimer">{{ ui("For reflection only — this reading is not financial advice.") }}</p>
        </div>
      </Transition>
    </ScreenContent>

    <Transition name="sheet">
      <div v-if="detailReading" class="money-sheet" @click.self="detailIndex = null">
        <div class="money-sheet__panel" role="dialog" aria-modal="true" :aria-label='ui("Card detail")'>
          <button
            type="button"
            class="money-sheet__close"
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
            variant="money"
          />
        </div>
      </div>
    </Transition>
  </main>
</template>

<style scoped>
.money__idle {
  padding-bottom: var(--space-2);
}

.money__intro {
  display: grid;
  gap: var(--space-2);
}

.money__eyebrow {
  color: var(--color-gold);
  font-family: var(--font-display);
  font-size: 12px;
  letter-spacing: 1.2px;
  text-align: center;
  text-transform: uppercase;
}

.money__initial-disclaimer {
  color: var(--color-text-muted);
  font-size: 12.5px;
  text-align: center;
}

.money__initial-disclaimer {
  font-size: 10.5px;
  line-height: 1.45;
}

.money-result {
  display: flex;
  width: 100%;
  max-width: 520px;
  flex-direction: column;
  align-items: center;
  gap: var(--space-4);
  margin: 0 auto;
  padding-bottom: var(--space-2);
}

.money-result__heading {
  display: grid;
  gap: var(--space-1);
  text-align: center;
}

.money-result__eyebrow {
  color: var(--color-gold);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 1.3px;
  text-transform: uppercase;
}

.money-result__title {
  font-size: 20px;
}

.money-result__steps {
  position: relative;
  display: grid;
  width: 100%;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--space-2);
}

.money-result__steps::before {
  position: absolute;
  top: 15px;
  left: 16.66%;
  right: 16.66%;
  height: 1px;
  background: var(--color-border);
  content: '';
}

.money-result__step {
  position: relative;
  z-index: 1;
  display: flex;
  min-width: 0;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 0 var(--space-1);
  border: 0;
  background: transparent;
  color: var(--color-text-muted);
  cursor: pointer;
  font-family: var(--font-sans);
  font-size: 10.5px;
  line-height: 1.2;
  -webkit-tap-highlight-color: transparent;
}

.money-result__step-number {
  display: inline-flex;
  width: 31px;
  height: 31px;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  background: var(--color-surface);
  color: var(--color-text-muted);
  font-family: var(--font-display);
  transition: border-color 200ms ease, background 200ms ease, color 200ms ease,
    box-shadow 200ms ease;
}

.money-result__step--active {
  color: var(--color-text);
}

.money-result__step--active .money-result__step-number {
  border-color: var(--color-gold);
  background: var(--color-gold-soft);
  color: var(--color-gold);
  box-shadow: 0 0 16px rgba(227, 197, 111, 0.28);
}

.money-result__step:focus-visible {
  outline: 2px solid var(--color-gold);
  outline-offset: 4px;
  border-radius: var(--radius-sm);
}

.money-result__focus {
  display: flex;
  width: 100%;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
  text-align: center;
}

.money-result__card-button {
  width: min(68vw, 250px);
  padding: 0;
  border: 0;
  border-radius: var(--radius-md);
  background: transparent;
  cursor: pointer;
  filter: drop-shadow(0 14px 28px rgba(0, 0, 0, 0.42));
  -webkit-tap-highlight-color: transparent;
}

.money-result__card-button:focus-visible {
  outline: 2px solid var(--color-gold);
  outline-offset: 5px;
}

.money-result__card-image {
  display: block;
  width: 100%;
  aspect-ratio: 300 / 420;
  border: 1px solid rgba(227, 197, 111, 0.32);
  border-radius: var(--radius-md);
}

.money-result__card-name {
  color: var(--color-gold);
  font-size: 22px;
}

.money-result__meaning {
  max-width: 460px;
  color: var(--color-text-muted);
  font-size: 13.5px;
  line-height: 1.65;
}

.money-result__detail-link {
  padding: var(--space-2) var(--space-3);
  border: 0;
  background: transparent;
  color: var(--color-gold);
  cursor: pointer;
  font-family: var(--font-sans);
  font-size: 13px;
  font-weight: 600;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.money-result__nav {
  display: grid;
  width: min(100%, 280px);
  grid-template-columns: 42px 1fr 42px;
  align-items: center;
  gap: var(--space-3);
}

.money-result__nav span {
  color: var(--color-text-muted);
  font-family: var(--font-display);
  font-size: 12px;
  letter-spacing: 1px;
  text-align: center;
}

.money-result__nav button {
  display: inline-flex;
  width: 42px;
  height: 42px;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  background: var(--color-surface);
  color: var(--color-gold);
  cursor: pointer;
  font-size: 22px;
}

.money-result__nav button:disabled {
  cursor: default;
  opacity: 0.32;
}

.money-card-enter-active,
.money-card-leave-active {
  transition: opacity 180ms ease, transform 220ms cubic-bezier(0.22, 1, 0.36, 1);
}

.money-card-enter-from {
  opacity: 0;
  transform: translateX(18px) scale(0.97);
}

.money-card-leave-to {
  opacity: 0;
  transform: translateX(-18px) scale(0.97);
}

.result-enter-active,
.result-leave-active {
  transition: opacity 240ms ease, transform 280ms cubic-bezier(0.22, 1, 0.36, 1);
}

.result-enter-from,
.result-leave-to {
  opacity: 0;
  transform: translateY(14px);
}

.money-sheet {
  position: fixed;
  inset: 0;
  z-index: 60;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: var(--space-4);
  background: rgba(10, 5, 25, 0.68);
}

.money-sheet__panel {
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
  border: 1px solid rgba(227, 197, 111, 0.3);
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  background: var(--color-surface-raised);
  box-shadow: var(--shadow-lg);
  -webkit-overflow-scrolling: touch;
}

.money-sheet__panel :deep(.result__image) {
  width: min(66vw, 250px);
  max-width: none;
}

.money-sheet__close {
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

.sheet-enter-active .money-sheet__panel,
.sheet-leave-active .money-sheet__panel {
  transition: transform 280ms cubic-bezier(0.22, 1, 0.36, 1);
}

.sheet-enter-from,
.sheet-leave-to {
  opacity: 0;
}

.sheet-enter-from .money-sheet__panel,
.sheet-leave-to .money-sheet__panel {
  transform: translateY(40px);
}

@media (prefers-reduced-motion: reduce) {
  .money-result__step-number,
  .money-card-enter-active,
  .money-card-leave-active,
  .result-enter-active,
  .result-leave-active {
    transition: none;
  }

  .money-card-enter-from,
  .money-card-leave-to,
  .result-enter-from,
  .result-leave-to {
    transform: none;
  }

  .sheet-enter-active,
  .sheet-leave-active,
  .sheet-enter-active .money-sheet__panel,
  .sheet-leave-active .money-sheet__panel {
    transition: none;
  }
}
</style>
